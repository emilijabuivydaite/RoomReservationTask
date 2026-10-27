interface Props {
  message?: string | null;
}

export default function ErrorAlert({ message }: Props) {
  if (!message) return null;
  return (
    <div className="alert alert-danger" role="alert">
      {message}
    </div>
  );
}
