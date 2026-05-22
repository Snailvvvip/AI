export const CourseTextLine = ({ text }: { text: string }) => {
  if (!text.match(/[:：]/)) {
    return <span>{text}</span>;
  }
  const [title] = text.split(/[:：]/);
  const content = text.slice(title.length + 1);
  // console.log({ title, content });
  return (
    <div className="course-text-line">
      <span data-title>{title}</span>
      <span data-content>{content}</span>
    </div>
  );
};
