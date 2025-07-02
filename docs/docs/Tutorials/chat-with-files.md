---
title: Create a chatbot that can ingest files
slug: /chat-with-files
---

import Icon from "@site/src/components/icon";
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Create a chatbot application that chats with files loaded from your local machine.

## Prerequisites

- [A running Langflow instance](/get-started-installation)
- [An OpenAI API key](https://platform.openai.com/api-keys)

    This tutorial uses an OpenAI LLM. If you want to use a different provider, you need a valid credential for that provider.

## Create a flow that accepts file input

To ingest files, your flow must have a **File** component attached to a component that receives input, such as a **Prompt** or **Agent** component.

The following steps modify the **Basic prompting** template to accept file input.
1. In Langflow, click **New Flow**, and then select the **Basic prompting** template.
2. In the **Language Model** component, enter your OpenAI API key.

    If you want to use a different provider or model, edit the **Model Provider**, **Model Name**, and **API Key** fields accordingly.
3. To verify that your API key is valid, click <Icon name="Play" aria-hidden="true" /> **Playground**, and then ask the LLM a question.
The LLM should respond as the **Prompt** component specifies.
4. Modify the **Prompt** component to accept file input in addition to chat input.
To do this, edit the **Template** field, and then replace the default prompt with the following text:
    ```text
    ChatInput:
    {chat-input}
    File:
    {file}
    ```
    The **Prompt** component gets a new input port for each value in curly braces. At this point, your **Prompt** component should have **chat-input** and **file** input ports.

    :::tip
    Within the curly braces, you can use any port name you like. For this tutorial, the ports are named after the components that connect to them.
    :::

5. Add a [File component](/components-data#file) to the flow, and then connect the **Raw Content** output to the Prompt component's **file** input.

You can add files directly to the file component to pre-load input before running the flow, or you can load files at runtime. The next section of this tutorial covers runtime file uploads.

    At this point your flow has five components. The Chat Input and File components are connected to the Prompt component's input ports. Then, the Prompt component's output port is connected to the Language Model component's input port. Finally, the Language Model component's output port is connected to the Chat Output component, which returns the final response to the user.

    ![File loader chat flow](/img/tutorial-chat-file-loader.png)

    The flow is complete.
    If you'd like, add files to the File component and chat with it within the Langflow IDE.
    In the next section, you will load files and chat with your flow from a Python application.

## Send requests to your flow from a Python application

With your flow running locally, send a request to `POST /run` to load a file to your flow, send a chat message, and get a result back.

:::tip
To easily construct file upload requests in Python, JavaScript, and curl templates, check out the [Langflow File Upload Utility](https://langflow-file-upload-examples.onrender.com).
:::

1. To construct the request, gather the following values from Langflow.

    * `LANGFLOW_SERVER_ADDRESS`: The default value is `127.0.0.1:7860`.
    * `FLOW_ID`: The UUID of your flow, or the endpoint name you've chosen.
    * File Component name: To find the ID of your file component, in the File component, click **Controls**. For this example, the component name is `File-KZP68`.
    * Input value: This is the message you want to send to the Chat Input of your flow, such as `Evaluate this resume for a job opening in my Marketing department.`
    * File path: The path to the local file you want to load with your request. This example is loading `fake-resume.txt` from the same file location as the script.
    * Session ID: Optional. For more information, see [session ID](/session-id).
    * Langflow API key: Required. To create an API key, see [API keys](/configuration-api-keys).

2. Replace the values in the script below.

    <details open>
        <summary>Python</summary>

    ```python
    # Python example using requests
    import requests
    import json

    # 1. Set the upload URL
    url = "http://LANGFLOW_SERVER_ADDRESS/api/v2/files/"

    # 2. Prepare the file and payload
    payload = {}
    files = [
      ('file', ('fake-resume.txt', open('fake-resume.txt', 'rb'), 'application/octet-stream'))
    ]
    headers = {
      'Accept': 'application/json',
      'x-api-key': 'LANGFLOW_API_KEY'
    }

    # 3. Upload the file to Langflow
    response = requests.request("POST", url, headers=headers, data=payload, files=files)
    print(response.text)

    # 4. Get the uploaded file path from the response
    uploaded_data = response.json()
    uploaded_path = uploaded_data.get('path')

    # 5. Call the Langflow run endpoint with the uploaded file path
    run_url = "http://LANGFLOW_SERVER_ADDRESS/api/v1/run/FLOW_ID"
    run_payload = {
        "input_value": "Evaluate this resume for a job opening in my Marketing department.",
        "output_type": "chat",
        "input_type": "chat",
        "tweaks": {
            "File-KZP68": {
                "path": uploaded_path
            }
        }
    }
    run_headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'x-api-key': 'LANGFLOW_API_KEY'
    }
    run_response = requests.post(run_url, headers=run_headers, data=json.dumps(run_payload))
    langflow_data = run_response.json()
    # Output only the message
    message = None
    try:
        message = langflow_data['outputs'][0]['outputs'][0]['results']['message']['data']['text']
    except (KeyError, IndexError, TypeError):
        pass
    print(message)

    ```
    </details>

    This script contains two requests.

    The first request uploads `fake-resume.txt` to your Langflow server at the `/api/v2/files` endpoint, which returns a file path that can be referenced in subsequent Langflow requests, `02791d46-812f-4988-ab1c-7c430214f8d5/fake-resume.txt`.

    The second request sends a chat message to the Langflow flow at the `/api/v1/run/` endpoint.
    The `tweaks` parameter includes the path to the uploaded file as the variable `uploaded_path`.

3. Run the script to send the request.

    <details open>
    <summary>Response</summary>

    ```
    {"id":"793ba3d8-5e7a-4499-8b89-d9a7b6325fee","name":"fake-resume (1)","path":"02791d46-812f-4988-ab1c-7c430214f8d5/fake-resume.txt","size":1779,"provider":null}
    The resume for Emily J. Wilson presents a strong candidate for a position in your Marketing department. Here are some key points to consider:

    ### Strengths:
    1. **Experience**: With over 8 years in marketing, Emily has held progressively responsible positions, culminating in her current role as Marketing Director. This indicates a solid foundation in the field.

    2. **Quantifiable Achievements**: The resume highlights specific accomplishments, such as a 25% increase in brand recognition and a 30% sales increase after launching new product lines. These metrics demonstrate her ability to drive results.

    3. **Diverse Skill Set**: Emily's skills encompass various aspects of marketing, including strategy development, team management, social media marketing, event planning, and data analysis. This versatility can be beneficial in a dynamic marketing environment.

    4. **Educational Background**: Her MBA and a Bachelor's degree in Marketing provide a strong academic foundation, which is often valued in marketing roles.

    5. **Certifications**: The Certified Marketing Professional (CMP) and Google Analytics Certification indicate a commitment to professional development and staying current with industry standards.

    ### Areas for Improvement:
    1. **Specificity in Skills**: While the skills listed are relevant, providing examples of how she has applied these skills in her previous roles could strengthen her resume further.

    2. **References**: While stating that references are available upon request is standard, including a couple of testimonials or notable endorsements could enhance credibility.

    3. **Formatting**: Ensure that the resume is visually appealing and easy to read. Clear headings and bullet points help in quickly identifying key information.

    ### Conclusion:
    Overall, Emily J. Wilson's resume reflects a well-rounded marketing professional with a proven track record of success. If her experience aligns with the specific needs of your Marketing department, she could be a valuable addition to your team. Consider inviting her for an interview to further assess her fit for the role.
    ```

    </details>

    The initial output contains the JSON response object from the file upload endpoint, with the internal path where Langflow stores the file.

    The LLM then retrieves this file and correctly evaluates its content, in this case the suitability of the resume for a job position.

## Next steps

* [Model Context Protocol (MCP) servers](/mcp-server)
* [Langflow deployment overview](/deployment-overview)