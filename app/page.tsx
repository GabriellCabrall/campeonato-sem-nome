"use client";

import { useEffect, useState } from "react";
import { ref, onValue, set } from "firebase/database";
import { db } from "@/lib/firebase";
import styles from "./Home.module.css";
import Image from "next/image";

type Participante = {
  nome: string;
  pontos: number;
};

export default function Home() {
  const [participantes, setParticipantes] = useState<Participante[]>([]);

  useEffect(() => {
    const participantesRef = ref(db, "participantes");
    const unsubscribe = onValue(participantesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const lista = Object.entries(data).map(([nome, pontos]) => ({
          nome,
          pontos: Number(pontos),
        }));
        setParticipantes(lista);
      }
    });

    return () => unsubscribe();
  }, []);

  const atualizarPontos = (nome: string, novoValor: number) => {
    set(ref(db, `participantes/${nome}`), novoValor);
  };

  const gerarCaminhoFoto = (nome: string) => {
    const nomeFormatado = nome
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-");
    return `/fotos/${nomeFormatado}.png`;
  };

  const participantesOrdenados = [...participantes].sort((a, b) => {
    if (b.pontos !== a.pontos) return b.pontos - a.pontos;
    return a.nome.localeCompare(b.nome);
  });

  const getPosicao = (index: number) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return `${index + 1}º`;
  };

  return (
    <div className={styles.container}>
      <div className={styles.overlay}>
        <h1 className={styles.titulo}>
          🏆 Campeonato de Cagadas do grupo sem nome. 🏆
          <br />⭐ Edição 2025 ⭐
        </h1>
        <ul className={styles.lista}>
          {participantesOrdenados.map((p, index) => (
            <li key={p.nome} className={styles.card}>
              <div className={styles.posicao}>{getPosicao(index)}</div>

              <div className={styles.info}>
                <Image
                  src={gerarCaminhoFoto(p.nome)}
                  alt={p.nome}
                  className={styles.foto}
                  width={48}
                  height={48}
                  priority
                />
                <div className={styles.nome}>{p.nome}</div>
              </div>

              <div className={styles.pontos}>
                <button onClick={() => atualizarPontos(p.nome, p.pontos - 1)}>
                  -
                </button>
                <span>{p.pontos}</span>
                <button onClick={() => atualizarPontos(p.nome, p.pontos + 1)}>
                  +
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
