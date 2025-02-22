import Head from "next/head";
import styles from "./styles.module.css";
import { GetServerSideProps } from "next";

import { db } from "../../services/firebaseConnection";
import {
  doc,
  addDoc,
  collection,
  query,
  where,
  getDoc,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import { Textarea } from "@/components/textarea";
import { FaTrash } from "react-icons/fa";

import { ChangeEvent, FormEvent, useState } from "react";
import { useSession } from "next-auth/react";

interface TaskProps {
  item: {
    tarefa: string;
    public: boolean;
    created: string;
    user: string;
    taskId: string;
  };
  allComments: CommentProps[];
}

interface CommentProps {
  id: string;
  comment: string;
  taskId: string;
  user: string;
  name: string;
}

export default function Task({ item, allComments }: TaskProps) {
  const { data: session } = useSession();
  const [input, setInput] = useState("");
  const [comments, setComments] = useState<CommentProps[]>(allComments || []);

  async function handleComment(event: FormEvent) {
    event.preventDefault();

    if (input === "") return;

    if (!session?.user?.email || !session?.user?.name) return;

    try {
      const docRef = await addDoc(collection(db, "comments"), {
        comment: input,
        user: session?.user?.email,
        name: session?.user?.name,
        taskId: item?.taskId,
        created: new Date(),
      });

      const data = {
        id: docRef.id,
        comment: input,
        user: session?.user?.email,
        name: session?.user?.name,
        taskId: item?.taskId,
      };

      setComments((oldItems) => [...oldItems, data]);

      setInput("");
    } catch (error) {
      console.log("Erro ao adicionar comentário: ", error);
    }
  }

  async function handleDeleteComment(id: string) {
    try {
      const docRef = doc(db, "comments", id);
      await deleteDoc(docRef);

      const deleteComment = comments.filter((comment) => comment.id !== id);
      setComments(deleteComment);
    } catch (error) {
      console.log("Erro ao deletar comentário: ", error);
    }
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Tarefa - Detalhes da tarefa</title>
      </Head>
      <main className={styles.main}>
        <h1>Tarefa</h1>
        <article className={styles.task}>
          <p>{item.tarefa}</p>
        </article>
      </main>

      <section className={styles.commentsContainer}>
        <h2>Deixar comentários</h2>
        <form onSubmit={handleComment}>
          <Textarea
            placeholder="Deixe seu comentário..."
            value={input}
            onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
              setInput(event.target.value)
            }
          />
          <button disabled={!session?.user} className={styles.button}>
            Enviar comentário
          </button>
        </form>
      </section>

      <section className={styles.commentsContainer}>
        <h2>Todos Comentários</h2>
        {comments.length === 0 && <p>Nenhum comentário encontrado</p>}

        {comments.map((comment) => (
          <article key={comment.id} className={styles.comment}>
            <div className={styles.headComment}>
              <label className={styles.commentsLabel}>{comment.name}</label>
              {comment.user === session?.user?.email && (
                <button
                  className={styles.buttonTrash}
                  onClick={() => handleDeleteComment(comment.id)}
                >
                  <FaTrash size={18} color="#ea3140" />
                </button>
              )}
            </div>
            <p>{comment.comment}</p>
          </article>
        ))}
      </section>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const id = params?.id as string;
  const docRef = doc(db, "tasks", id);

  const q = query(collection(db, "comments"), where("taskId", "==", id));
  const snapshotComments = await getDocs(q);
  let allComments: CommentProps[] = [];
  snapshotComments.forEach((doc) => {
    allComments.push({
      id: doc.id,
      comment: doc.data().comment,
      taskId: doc.data().taskId,
      user: doc.data().user,
      name: doc.data().name,
    });
  });

  console.log(allComments);

  const snapshot = await getDoc(docRef);
  if (snapshot.data() === undefined) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  if (!snapshot.data()?.publica) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const miliseconds = snapshot.data()?.created.seconds * 1000;
  const task = {
    tarefa: snapshot.data()?.tarefa,
    public: snapshot.data()?.publica,
    created: new Date(miliseconds).toLocaleDateString("pt-BR"),
    user: snapshot.data()?.user,
    taskId: snapshot.id,
  };

  return {
    props: {
      item: task,
      allComments: allComments,
    },
  };
};
