import {
  ariaDescribedByIds,
  descriptionId,
  FormContextType,
  getTemplate,
  labelValue,
  RJSFSchema,
  StrictRJSFSchema,
  WidgetProps,
} from '@rjsf/utils'
import { Switch } from '@/components/ui/switch'
import { cn } from '../lib/utils'

/** The `CheckBoxWidget` is a widget for rendering boolean properties.
 *  It is typically used to represent a boolean.
 *
 * @param props - The `WidgetProps` for this component
 */
export default function CheckboxWidget<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any
>(props: WidgetProps<T, S, F>) {
  const {
    id,
    value,
    disabled,
    readonly,
    required,
    label,
    hideLabel,
    schema,
    autofocus,
    options,
    onChange,
    onBlur,
    onFocus,
    registry,
    uiSchema,
    className,
  } = props
  const DescriptionFieldTemplate = getTemplate<'DescriptionFieldTemplate', T, S, F>(
    'DescriptionFieldTemplate',
    registry,
    options
  )

  const _onChange = (checked: boolean) => onChange(checked)
  const _onBlur = () => onBlur(id, value)
  const _onFocus = () => onFocus(id, value)

  const description = options.description || schema.description
  return (
    <div
      className={`relative flex justify-between items-center border border-input rounded-md p-2 ${
        disabled || readonly ? 'cursor-not-allowed opacity-50' : ''
      }`}
      aria-describedby={ariaDescribedByIds(id)}
    >
      <div>
        <label
          className={cn(
            'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
          )}
          htmlFor={id}
        >
          {labelValue(label, hideLabel || !label)}
        </label>
        {/* <div className="flex flex-row gap-1  justify-between items-center border border-input rounded-md p-2"> */}

        {/* </div> */}
        {description && (
          <DescriptionFieldTemplate
            id={descriptionId(id)}
            description={description}
            schema={schema}
            uiSchema={uiSchema}
            registry={registry}
          />
        )}
      </div>
      <Switch
        id={id}
        size="sm"
        checked={typeof value === 'undefined' ? false : Boolean(value)}
        disabled={disabled || readonly}
        autoFocus={autofocus}
        onCheckedChange={_onChange}
        onBlur={_onBlur}
        onFocus={_onFocus}
        className={className}
      />
    </div>
  )
}
