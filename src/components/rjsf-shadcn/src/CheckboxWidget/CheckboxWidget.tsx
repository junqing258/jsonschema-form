import {
  ariaDescribedByIds,
  descriptionId,
  FormContextType,
  getTemplate,
  labelValue,
  RJSFSchema,
  StrictRJSFSchema,
  WidgetProps,
} from '@rjsf/utils';
import { Label } from '../components/ui/label';
import { Switch } from '@/components/ui/switch';

/** The `CheckBoxWidget` is a widget for rendering boolean properties.
 *  It is typically used to represent a boolean.
 *
 * @param props - The `WidgetProps` for this component
 */
export default function CheckboxWidget<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any,
>(props: WidgetProps<T, S, F>) {
  const {
    id,
    value,
    disabled,
    readonly,
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
  } = props;
  const DescriptionFieldTemplate = getTemplate<'DescriptionFieldTemplate', T, S, F>(
    'DescriptionFieldTemplate',
    registry,
    options,
  );

  const _onChange = (checked: boolean) => onChange(checked);
  const _onBlur = () => onBlur(id, value);
  const _onFocus = () => onFocus(id, value);

  const description = options.description || schema.description;
  return (
    <div
      className={`relative ${disabled || readonly ? 'cursor-not-allowed opacity-50' : ''}`}
      aria-describedby={ariaDescribedByIds(id)}
    >
      {!hideLabel && description && (
        <DescriptionFieldTemplate
          id={descriptionId(id)}
          description={description}
          schema={schema}
          uiSchema={uiSchema}
          registry={registry}
        />
      )}
      <div className='flex items-center gap-2 my-2'>
        <Switch
          id={id}
          checked={typeof value === 'undefined' ? false : Boolean(value)}
          disabled={disabled || readonly}
          autoFocus={autofocus}
          onCheckedChange={_onChange}
          onBlur={_onBlur}
          onFocus={_onFocus}
          className={className}
        />
        <Label className='leading-tight' htmlFor={id}>
          {labelValue(label, hideLabel || !label)}
        </Label>
      </div>
    </div>
  );
}
