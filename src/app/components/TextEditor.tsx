"use client";
import axios from "axios";
import { motion } from "framer-motion";
import "react-quill/dist/quill.snow.css";
import ReactQuill from "react-quill";

import { useState, useEffect } from "react";
import { TrashIcon, CheckCircleIcon } from "@heroicons/react/outline";
import { v4 as uuidv4 } from "uuid";

interface FormSection {
  id: any | number;
  expanded: boolean;
  taskname: string;
  taskdescription: string;
  completed?: boolean;
}

export default function TextEditor() {
  const [textChange, settextChange] = useState(false);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [todoToBeUpdated, setTodoToBeUpdated] = useState<FormSection | null>();
  const [todoIsUpdated, setTodoIsUpdated] = useState<boolean>(false);
  const [formSections, setFormSections] = useState<FormSection[]>([]);
  const [myTaskName, setTaskName] = useState("");
  const [myTaskDescription, setTaskDescription] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("/api/getalltodos");
        console.log(res);

        setFormSections(res.data.data.rows);
      } catch (error: any) {
        console.log("Failed to fetch tasks", error.message);
      }
    };

    fetchData();
  }, []);

  const handleClick = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    if (myTaskName.length === 0 && myTaskDescription.length == 0) {
      alert("Empty form cann't be submitted");
      return;
    }
    setLoadingBtn(true);
    try {
      const uu_id = uuidv4();
      const res = await axios.post("/api/create", {
        id: uu_id,
        taskname: myTaskName,
        taskdescription: myTaskDescription,
      });

      setFormSections([
        ...formSections,
        {
          id: uu_id,
          expanded: false,
          taskname: myTaskName,
          taskdescription: myTaskDescription,
        },
      ]);
      settextChange(true);
    } catch (error: any) {
      console.log("An error has occured", error.message);
    } finally {
      setTaskName("");
      setTaskDescription("");
      setLoadingBtn(false);
    }

    if (!textChange) {
      settextChange(!textChange);
    }
  };
  const toggleSection = (id: number) => {
    setFormSections((prevSection) =>
      prevSection.map((section) => {
        if (section.id === id) {
          return { ...section, expanded: !section.expanded };
        } else {
          return section;
        }
      })
    );
  };

  const onUpdateHandler = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    setLoadingBtn(true);

    if (!todoToBeUpdated) {
      // {error occuring so i add it in line 100}
      console.error("todoToBeUpdated is undefined");
      setLoadingBtn(false);
      return;
    }
    try {
      const res = await axios.patch("/api/update", { ...todoToBeUpdated });

      if (res.status === 200) {
        setTodoIsUpdated(false);
        setFormSections(
          formSections.map((section) =>
            section.id === todoToBeUpdated.id ? todoToBeUpdated : section
          )
        );
      }
    } catch (error: any) {
      console.log("error", error.message);
    } finally {
      setLoadingBtn(false);
    }
  };
  const deleteSection = async (id: any | number) => {
    console.log(id);

    try {
      const res = await axios.delete("/api/del", { data: { id } });
      if (res.status === 200) {
        setFormSections((prevSections) =>
          prevSections.filter((section) => section.id !== id)
        );
      } else {
        console.log("Error occurred", res.data.error);
      }
    } catch (error: any) {
      console.log("Deletion Failed, error occurred", error.message);
    }
  };

  const toggleCompletion = (id: any | number) => {
    setFormSections((prevSections) =>
      prevSections.map((section) =>
        section.id === id
          ? { ...section, completed: !section.completed }
          : section
      )
    );
  };
  const modules = {
    toolbar: [
      [{ header: "1" }, { header: "2" }, { font: [] }],
      [{ size: [] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image"],
      ["clean"],
    ],
  };

  const stripHtml = (html: string) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  };

  return (
    <>
      <motion.h1
        className="txt_heading"
        id="content"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.8,
          delay: 0.5,
          ease: [0, 0.71, 0.2, 1.01],
        }}
      >
        To-Do-List
      </motion.h1>
      <motion.h2
        className="txt_heading text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.8,
          delay: 0.5,
          ease: [0, 0.71, 0.2, 1.01],
        }}
      >
        Add Your Daily Work Here
      </motion.h2>

      <br />
      <br />
      {todoIsUpdated ? (
        <motion.div
          className="text-white"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.8,
            delay: 0.5,
            ease: [0, 0.71, 0.2, 1.01],
          }}
        >
          <form className="max-w-sm mx-auto">
            <div className="mb-5">
              <label
                htmlFor="username-success"
                className="block mb-2 text-lg font-lg text-[#7651AE] dark:text-[#7651AE]"
              >
                Update Task Name
              </label>
              <input
                type="text"
                id="username-success"
                className="bg-[#302640] sm:pl-6 border-2 border-[#7651AE] text-white placeholder-white dark:placeholder-white text-sm rounded-lg focus:ring-[#7651AE] focus:border-[#7651AE] block w-full p-5 dark:bg-[#302640] dark:border-[#7651AE] transition-border-color duration-300 ease-in-out"
                value={todoToBeUpdated?.taskname}
                placeholder="Task Name"
                onChange={(e: any) => {
                  todoToBeUpdated != null &&
                    todoToBeUpdated != undefined &&
                    setTodoToBeUpdated({
                      ...todoToBeUpdated,
                      taskname: e.target.value,
                    });
                }}
              />
              <p className="mt-2 text-sm text-[#7651AE] dark:text-[#7651AE]">
                <span className="font-medium">Keep </span>Task as precise as
                possible.
              </p>
            </div>
            <label
              htmlFor="message"
              className="block mb-2 text-lg font-lg text-[#7651AE] dark:text-[#7651AE]"
            >
              Update your task
            </label>
            <ReactQuill
              modules={modules}
              theme="snow"
              value={todoToBeUpdated?.taskdescription || ""}
              onChange={(e: any) => {
                if (todoToBeUpdated) {
                  console.log("Editor content:", e);
                  setTodoToBeUpdated({
                    ...todoToBeUpdated,
                    taskdescription: e,
                  });
                }
              }}
            />
            <br />
            <div className="flex flex-col items-center">
              {loadingBtn && (
                <div role="status">
                  <svg
                    aria-hidden="true"
                    className="inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-purple-600"
                    viewBox="0 0 100 101"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                      fill="currentColor"
                    />
                    <path
                      d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                      fill="currentFill"
                    />
                  </svg>
                  <span className="sr-only">Loading...</span>
                </div>
              )}
            </div>
            <button className="form_btn" onClick={onUpdateHandler}>
              Update Task
            </button>
          </form>
        </motion.div>
      ) : (
        // Else statement started my first view form

        <motion.form
          className="max-w-sm mx-auto"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.8,
            delay: 0.5,
            ease: [0, 0.71, 0.2, 1.01],
          }}
        >
          <div className="mb-5">
            <label
              htmlFor="username-success"
              className="block mb-2 text-lg font-lg text-[#7651AE] dark:text-[#7651AE] "
            >
              Task Name
            </label>
            <input
              type="text"
              id="username-success"
              className="bg-[#302640] border-2 border-[#7651AE] text-white placeholder-white dark:placeholder-white text-sm rounded-lg focus:ring-[#7651AE] focus:border-[#7651AE] block w-full p-5 dark:bg-[#302640] dark:border-[#7651AE] transition-border-color duration-300 ease-in-out"
              value={myTaskName}
              placeholder="Task Name"
              onChange={(e) => setTaskName(e.target.value)}
            />
            <p className="mt-2 text-sm text-[#7651AE] dark:text-[#7651AE]">
              <span className="font-medium">Keep </span>Task as precise as
              possible.
            </p>
          </div>
          <label
            htmlFor="message"
            className="block mb-2 text-lg font-lg text-[#7651AE] dark:text-[#7651AE]"
          >
            Describe your task
          </label>
          <textarea
            id="message"
            rows={4}
            className="block p-3 w-full text-sm text-white bg-[#302640] rounded-lg border-1 border-[#7651AE] placeholder-white dark:placeholder-white dark:bg-[#302640] dark:border-[#7651AE] dark:text-white dark:focus:ring-[#7651AE] dark:focus:border-[#7651AE] focus:ring-[#7651AE] focus:border-[#7651AE] transition-border-color duration-300 ease-in-out

  sm:p-2 sm:text-base
  md:p-3 md:text-sm
  lg:p-4 lg:text-base"
            placeholder="Task Description"
            required
            value={myTaskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
            defaultValue={""}
          />
          <div className="flex flex-col items-center">
            <br />
            {loadingBtn && (
              <div role="status">
                <svg
                  aria-hidden="true"
                  className="inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-purple-600"
                  viewBox="0 0 100 101"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="currentColor"
                  />
                  <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="currentFill"
                  />
                </svg>
                <span className="sr-only">Loading...</span>
              </div>
            )}{" "}
          </div>

          <button className="form_btn" onClick={handleClick}>
            Submit
          </button>
        </motion.form>
      )}

      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.8,
          delay: 0.5,
          ease: [0, 0.71, 0.2, 1.01],
        }}
      >
        {textChange || formSections?.length > 0 ? (
          <h2
            className="txt_heading"
            style={{ fontSize: "25px", textDecoration: "underline" }}
          >
            List of todos
          </h2>
        ) : (
          <h2
            className="txt_heading"
            style={{ fontSize: "25px", textDecoration: "underline" }}
          >
            Nothing in the Queue
          </h2>
        )}
        <br />
        <br />
      </motion.div>

      {/* form section here  */}

      <div className="Display_section_of_input">
        {formSections?.map((section) => (
          <div
            id="accordion-collapse"
            data-accordion="collapse"
            key={section.id}
            className="mb-4"
          >
            <h2 id={`accordion-collapse-heading-${section.id}`} className="">
              <button
                type="button"
                onClick={() => toggleSection(section.id)}
                className="flex items-center justify-between w-full p-5 font-lg bg-[#302640] border-2 border-[#7651AE] text-white rounded-lg focus:ring-[#7651AE] focus:border-[#7651AE] md:flex-row smallMobile:w-[100%]"
                aria-expanded={section.expanded}
                aria-controls={`accordion-collapse-body-${section.id}`}
              >
                <span className="font-bold bg-transparent flex-grow text-left">
                  {section.taskname || section.taskname}
                </span>
                <div className="flex items-center space-x-2">
                  {section.completed && (
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  )}
                  <svg
                    style={{ color: "#7651AE" }}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5 cursor-pointer"
                    onClick={() => {
                      setTodoIsUpdated(true);
                      setTodoToBeUpdated(section);
                      const clickedTodo = formSections.find(
                        (item) => item.id === section.id
                      );
                      if (clickedTodo) {
                        setTodoToBeUpdated(clickedTodo);
                      } else {
                        console.error("Todo not found");
                      }
                    }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                    />
                  </svg>
                  <TrashIcon
                    className="w-5 h-5 text-red-500 cursor-pointer"
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      deleteSection(section.id);
                    }}
                  />
                  <svg
                    className={`w-3 h-3 ${
                      section.expanded ? "rotate-180" : ""
                    } shrink-0`}
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 10 6"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5 5 1 1 5"
                    />
                  </svg>
                </div>
              </button>
            </h2>
            <div
              id={`accordion-collapse-body-${section.id}`}
              className={`${section.expanded ? "block" : "hidden"}`}
              aria-labelledby={`accordion-collapse-heading-${section.id}`}
            >
              <div className="p-2 border rounded-lg border-[#7651AE] bg-[#302640]">
                <p className="mb-2 text-white bg-transparent">
                  {section.taskdescription || section.taskdescription}
                </p>
                <button
                  className="text-white bg-[#7651AE] hover:bg-[#674698] font-bold py-1 px-2 rounded-lg flex justify-end"
                  onClick={() => toggleCompletion(section.id)}
                >
                  {section.completed
                    ? "Mark as Incomplete"
                    : "Mark as Complete"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <br />
      <br />
    </>
  );
}
