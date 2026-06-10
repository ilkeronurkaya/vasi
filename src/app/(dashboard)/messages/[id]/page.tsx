
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function MessagePage() {
  const router = useRouter();
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (router.isReady) {
      fetch(`/api/messages/${router.query.id}`)
        .then(response => response.json())
        .then(data => setMessage(data))
        .catch(error => console.error('Error fetching message:', error));
    }
  }, [router.isReady, router.query.id]);

  return (
    <div>
      {message ? (
        <div>
          <h1>{message.title}</h1>
          <p>{message.content}</p>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
