import "./App.css";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type Todo = {
  userId: number;
  id: number;
  title: string;
  body: string;
};
type Todos = Todo[];

function App() {
  const id = 55;
  const queryClient = useQueryClient();
  const { data, error, isLoading } = useQuery<Todos>({
    queryKey: ["posts"],
    queryFn: () =>
      fetch("https://jsonplaceholder.typicode.com/posts").then((res) =>
        res.json()
      ),
    // staleTime: 4000 /* робить оновлення даних, якщо наприклад переходили на нову
    // сторінку і повернулись на стару, або коли встановлений новий запит,
    // або коли мережа була відключена, або коли запит був змінений */,
    refetchInterval: 4000 /* робить запит кожні 4 секунди автоматично */,
    enabled: !!id /* запит буде виконуватись, допоки enabled буде true */,
    refetchOnWindowFocus: false /* скасовує повторні запити при зміні фокуса 
    на інших вікнах і поверненні на попередню сторінку */,
    retry: 5 /* якщо запит невдалий, то запит буде робитись повторно 5 разів, 
    а потім здасться */,
  });

  /* Use mutation query with queryClient.setQueryData for manually putting 
  new value to cache state */
  const { mutate, isPending, isError, isSuccess } = useMutation({
    mutationFn: (newPost: Todo) =>
      fetch("https://jsonplaceholder.typicode.com/posts", {
        method: "POST",
        body: JSON.stringify(newPost),
        headers: { "Content-type": "application/json; charset=UTF-8" },
      }).then((res) => res.json()),
    onSuccess: (newPost) => {
      // queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.setQueryData(["posts"], (oldPosts: Todos) => [
        ...oldPosts,
        newPost,
      ]);
    },
  });

  /* Use mutation query with queryClient.invalidateQueries for upd cache */
  // const { mutate, isPending, isError, isSuccess } = useMutation({
  //   mutationFn: (newPost: Todo) =>
  //     fetch("https://jsonplaceholder.typicode.com/posts", {
  //       method: "POST",
  //       body: JSON.stringify(newPost),
  //       headers: { "Content-type": "application/json; charset=UTF-8" },
  //     }).then((res) => res.json()),
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ["posts"] });
  //   },
  // });

  if (error || isError) return <div>There was an error</div>;

  if (isLoading) return <div>Data is loading</div>;

  return (
    <div>
      {isPending && <p>data is being added ...</p>}
      <button
        onClick={() =>
          mutate({
            userId: 1000,
            id: 1000,
            title: "Hey Pedro",
            body: "This is a body",
          })
        }
      >
        ADD POST
      </button>

      {data?.map((post) => (
        <div key={post.id}>
          <h4>ID: {post.id}</h4>
          <div>Title: {post.title}</div>
          <div>{post.body}</div>
        </div>
      ))}
    </div>
  );
}

export default App;
