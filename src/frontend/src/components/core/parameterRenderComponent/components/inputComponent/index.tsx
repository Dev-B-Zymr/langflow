import ForwardedIconComponent from "@/components/common/genericIconComponent";
import { Input } from "@/components/ui/input";
import { ICON_STROKE_WIDTH } from "@/constants/constants";
import { InputComponentType } from "@/types/components";
import { handleKeyDown } from "@/utils/reactflowUtils";
import { classNames, cn } from "@/utils/utils";
import * as Form from "@radix-ui/react-form";
import { useEffect, useRef, useState } from "react";
import { getIconName } from "./components/helpers/get-icon-name";
import CustomInputPopover from "./components/popover";
import CustomInputPopoverObject from "./components/popoverObject";

export default function InputComponent({
  autoFocus = false,
  onBlur,
  value = "",
  onChange,
  disabled,
  required = false,
  isForm = false,
  password,
  editNode = false,
  placeholder = "Type something...",
  className,
  id = "",
  blurOnEnter = false,
  optionsIcon = "ChevronsUpDown",
  selectedOption,
  setSelectedOption,
  selectedOptions = [],
  setSelectedOptions,
  options = [],
  optionsPlaceholder = "Search options...",
  optionsButton,
  optionButton,
  objectOptions,
  isObjectOption = false,
  name,
  onChangeFolderName,
  nodeStyle,
  isToolMode,
  popoverWidth,
  commandWidth,
  blockAddNewGlobalVariable = false,
  hasRefreshButton = false,
}: InputComponentType): JSX.Element {
  const [pwdVisible, setPwdVisible] = useState(false);
  const refInput = useRef<HTMLInputElement>(null);
  const [showOptions, setShowOptions] = useState<boolean>(false);

  useEffect(() => {
    if (disabled && value && onChange && value !== "") {
      onChange("", true);
    }
  }, [disabled]);

  function onInputLostFocus(event): void {
    if (onBlur) onBlur(event);
  }

  function handleSaveVariable() {
    let data: {
      name: string;
      value: string;
      type?: string;
      default_fields?: string[];
    } = {
      name: key,
      type,
      value,
      default_fields: fields,
    };

    mutateAddGlobalVariable(data, {
      onSuccess: (res) => {
        const { name } = res;
        setKey("");
        setValue("");
        setType("");
        setFields([]);
        setOpen(false);

        setSuccessData({
          title: `Variable ${name} ${initialData ? "updated" : "created"} successfully`,
        });
      },
      onError: (error) => {
        let responseError = error as ResponseErrorDetailAPI;
        setErrorData({
          title: `Error ${initialData ? "updating" : "creating"} variable`,
          list: [
            responseError?.response?.data?.detail ??
              `An unexpected error occurred while ${initialData ? "updating a new" : "creating"} variable. Please try again.`,
          ],
        });
      },
    });
  }

  return (
    <div className="relative w-full">
      {isForm ? (
        <Form.Control asChild>
          <Input
            name={name}
            id={"form-" + id}
            ref={refInput}
            onBlur={onInputLostFocus}
            autoFocus={autoFocus}
            type={password && !pwdVisible ? "password" : "text"}
            value={value}
            disabled={disabled}
            required={required}
            className={classNames(
              password && !pwdVisible && value !== ""
                ? "text-clip password"
                : "",
              editNode ? "input-edit-node" : "",
              password && editNode ? "pr-8" : "",
              password && !editNode ? "pr-10" : "",
              className!,
            )}
            placeholder={password && editNode ? "Key" : placeholder}
            onChange={(e) => {
              if (onChangeFolderName) {
                return onChangeFolderName(e);
              }
              onChange && onChange(e.target.value);
            }}
            onCopy={(e) => {
              e.preventDefault();
            }}
            onKeyDown={(e) => {
              handleKeyDown(e, value, "");
              if (blurOnEnter && e.key === "Enter") refInput.current?.blur();
            }}
          />
        </Form.Control>
      ) : (
        <>
          {isObjectOption ? (
            // Content to render when isObjectOption is true
            <CustomInputPopoverObject
              refInput={refInput}
              handleKeyDown={handleKeyDown}
              optionButton={optionButton}
              optionsButton={optionsButton}
              showOptions={showOptions}
              onChange={onChange}
              id={`object-${id}`}
              onInputLostFocus={onInputLostFocus}
              selectedOption={selectedOption}
              setSelectedOption={setSelectedOption}
              selectedOptions={selectedOptions}
              setSelectedOptions={setSelectedOptions}
              options={objectOptions}
              value={value}
              editNode={editNode}
              autoFocus={autoFocus}
              disabled={disabled}
              setShowOptions={setShowOptions}
              required={required}
              placeholder={placeholder}
              blurOnEnter={blurOnEnter}
              optionsPlaceholder={optionsPlaceholder}
              className={className}
            />
          ) : (
            <CustomInputPopover
              refInput={refInput}
              handleKeyDown={handleKeyDown}
              optionButton={optionButton}
              optionsButton={optionsButton}
              showOptions={showOptions}
              onChange={onChange}
              id={`popover-anchor-${id}`}
              onInputLostFocus={onInputLostFocus}
              selectedOption={selectedOption}
              setSelectedOption={setSelectedOption}
              selectedOptions={selectedOptions}
              setSelectedOptions={setSelectedOptions}
              value={value}
              autoFocus={autoFocus}
              disabled={disabled}
              setShowOptions={setShowOptions}
              required={required}
              password={password}
              pwdVisible={pwdVisible}
              editNode={editNode}
              placeholder={placeholder}
              blurOnEnter={blurOnEnter}
              options={options}
              optionsPlaceholder={optionsPlaceholder}
              nodeStyle={nodeStyle}
              popoverWidth={popoverWidth}
              commandWidth={commandWidth}
              blockAddNewGlobalVariable={blockAddNewGlobalVariable}
              hasRefreshButton={hasRefreshButton}
              name={name}
            />
          )}
        </>
      )}

      {(setSelectedOption || setSelectedOptions) &&
        !blockAddNewGlobalVariable && (
          <span
            className={cn(
              password && selectedOption === "" ? "right-8" : "right-0",
              "absolute inset-y-0 flex items-center pr-2.5",
              disabled && "cursor-not-allowed opacity-50",
            )}
          >
            <button
              disabled={disabled}
              onClick={(e) => {
                if (disabled) return;
                if (name === "api_key" && value !== "") {
                  handleSaveVariable();
                  return;
                }

                setShowOptions(!showOptions);
                e.preventDefault();
                e.stopPropagation();
              }}
              className={cn(
                onChange && setSelectedOption && selectedOption !== ""
                  ? "text-accent-emerald-foreground"
                  : "text-placeholder-foreground",
                !disabled && "hover:text-foreground",
              )}
            >
              {name === "api_key" && selectedOptions === "" ? (
                <div className="text-input-foreground text-[12px]">
                  {value === "" ? "Add" : "Save"} variable
                </div>
              ) : name !== "api_key" ? (
                <ForwardedIconComponent
                  name={
                    getIconName(
                      disabled!,
                      selectedOption!,
                      optionsIcon,
                      nodeStyle!,
                      isToolMode!,
                    ) || "ChevronsUpDown"
                  }
                  className={cn(
                    disabled
                      ? "cursor-grab text-placeholder"
                      : "cursor-pointer",
                    "icon-size",
                  )}
                  strokeWidth={ICON_STROKE_WIDTH}
                  aria-hidden="true"
                />
              ) : null}
            </button>
          </span>
        )}

      {password && (!setSelectedOption || selectedOption === "") && (
        <button
          type="button"
          tabIndex={-1}
          className={classNames(
            "mb-px mr-3 p-0",
            editNode
              ? "input-component-true-button"
              : "input-component-false-button",
          )}
          onClick={(event) => {
            event.preventDefault();
            setPwdVisible(!pwdVisible);
          }}
        >
          {pwdVisible ? (
            <ForwardedIconComponent
              name="Eye"
              className="relative top-[1px] h-5 w-5 text-placeholder-foreground hover:text-foreground"
            />
          ) : (
            <ForwardedIconComponent
              name="EyeOff"
              className="relative top-[1px] h-5 w-5 text-placeholder-foreground hover:text-foreground"
            />
          )}
        </button>
      )}
    </div>
  );
}
