export function SelectLabel(props: {
  value: any,
  options: { label: string, value: string }[],
  formatter?: (label: string | undefined | null) => any
}) {
  const label = props.value == null ? '' : props.options.find(i => i.value === props.value)?.label;
  return (
    <span>{props.formatter ? props.formatter(label) : label}</span>
  );
}
