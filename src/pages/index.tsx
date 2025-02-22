import Head from "next/head";
import styles from "@/styles/home.module.css";
import Image from "next/image";

import heroImg from "../../public/assets/hero.png";

import { GetStaticProps } from "next";
import { db } from "../services/firebaseConnection";
import { collection, getDocs } from "firebase/firestore";

interface HomeProps {
  comments: number;
  tasks: number;
}

export default function Home({ comments, tasks }: HomeProps) {
  return (
    <div className={styles.container}>
      <Head>Tarefas+ | Organize suas tarefas de forma fácil</Head>

      <main className={styles.main}>
        <div className={styles.logoContent}>
          <Image
            className={styles.hero}
            src={heroImg}
            alt="Logo Tarefas+"
            priority
          />
        </div>
        <h1 className={styles.title}>
          Sistema feito para você organizar <br />
          seus estudos e tarefas
        </h1>

        <div className={styles.infoContent}>
          <section className={styles.box}>
            <span>+{tasks} tasks</span>
          </section>
          <section className={styles.box}>
            <span>+{comments} comentários</span>
          </section>
        </div>
      </main>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const commentRef = collection(db, "comments");
  const commentSnapshot = await getDocs(commentRef);

  const taskRef = collection(db, "tasks");
  const taskSnapshot = await getDocs(taskRef);

  return {
    props: {
      comments: commentSnapshot.size || 0,
      tasks: taskSnapshot.size || 0,
    },
    revalidate: 60, // seria revalidado a cada 60 segundos
  };
};
