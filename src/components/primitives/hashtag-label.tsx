type HashtagLabelProps = {
  index: string;
  label: string;
  className?: string;
};

/** Swiss section marker, e.g. "#02 / ABOUT". */
export function HashtagLabel({ index, label, className = "" }: HashtagLabelProps) {
  return (
    <span className={`u-label inline-flex items-center gap-2 ${className}`}>
      <span className="text-red">#{index}</span>
      <span aria-hidden className="u-slash">
        /
      </span>
      <span>{label}</span>
    </span>
  );
}
