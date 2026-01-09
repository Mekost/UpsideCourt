import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import "./MainMenu.css"

export function MainMenu() {
  const [cases, setCases] = useState([]);
	useEffect(() => {
	  fetchCases();
	}, []);

	const fetchCases = async () => {
	  const res = await fetch("http://localhost:3000/get-cases");
	  const data = await res.json();
	  setCases(data);
	};

	const [caseName, setCaseName] = useState("");
	const [notesFiles, setNotesFiles] = useState([]);

  const [showModal, setShowModal] = useState(false);

	const addCase = async () => {
	  if (!caseName || notesFiles.length === 0) return;

	  const formData = new FormData();
	  formData.append("quizName", caseName);
		for (let file of notesFiles) {
			formData.append("notes", file);
		}

	  await fetch("http://localhost:3000/process-notes", {
		method: "POST",
		body: formData,
	  });

	  setCaseName("");
	  setNotesFiles([]);
	  setShowModal(false);

	  fetchCases(); // refresh list
	};

  return (
    <div className="menu min-h-screen bg-gradient-to-br from-stone-900 to-stone-800 text-stone-100 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold mb-6 text-center"
        >
          ⚖️ Sąd Downside
        </motion.h1>

        <div className="bg-stone-850 rounded-2xl shadow-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Dostępne rozprawy</h2>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 transition"
            >
              + Dodaj nową rozprawę
            </button>
          </div>

          <ul className="grid gap-3">
			{cases.map((c) => (
				<li>
                        <Link to={`/trials/${c.id}`}>{c.id}. {c.name}</Link>
			  </li>
			))}
			</ul>
        </div>
      </div>

      {showModal && createPortal(
        <div className="popup fixed inset-0 bg-black/60 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-stone-800 rounded-2xl p-6 w-full max-w-md"
          >
            <h3 className="text-xl font-semibold mb-4">Dodawanie nowej rozprawy</h3>

            <div className="space-y-3">
				<div>
              <input
                value={caseName}
                onChange={(e) => setCaseName(e.target.value)}
                placeholder="Nazwa rozprawy"
                className="w-full rounded-xl bg-stone-700 p-3 outline-none"
              />
				</div>
				<label>Notatki: </label>
				<input
				  type="file"
					multiple
				  accept=".pdf,.txt,.md,.doc,.docx"
				  onChange={(e) => setNotesFiles(e.target.files)}
				  className="w-full rounded-xl bg-stone-700 p-3 outline-none
							 file:mr-4 file:rounded-lg file:border-0
							 file:bg-amber-600 file:px-4 file:py-2
							 file:text-sm file:text-white
							 hover:file:bg-amber-500"
				/>
            </div>

            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-xl bg-stone-600 hover:bg-stone-500"
              >
                Anuluj
              </button>
              <button
                onClick={addCase}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500"
              >
                Dodaj rozprawę
              </button>
            </div>
          </motion.div>
        </div>,
        document.body
      )}
    </div>
  );
}

