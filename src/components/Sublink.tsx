type SublinkProps = {
  url: string;
  title: string;
};

function Sublink({ url, title }: SublinkProps) {
  return (
    <a
      href={url}
      className="group rounded-lg border border-transparent px-1 py-1 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30 min-w-8"
      target="_blank"
      rel="noopener noreferrer"
    >
      <p className="p-2">{title}</p>
    </a>
  );
}

export default Sublink;
