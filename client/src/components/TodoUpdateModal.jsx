import React, { useState } from "react";
import { produce } from "immer";

const UpdateField = ({ setData, data, index }) => {
  const handleUpdate = (e) => {
    const newData = produce(data, (draft) => {
      draft[index]["title"] = e.target.value;
    });
    setData(newData);
  };

  return (
    <div className="text-left">
      <input
        className="shadow appearance-none border rounded w-full m-3 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        id={data[index] ? data[index]._id : null}
        type="text"
        placeholder="Enter todo"
        value={data[index] ? data[index].title : null}
        onChange={handleUpdate}
      />
    </div>
  );
};

export default function TodoUpdateModal({ todos, projectSocketRef }) {
  const [showModal, setShowModal] = useState(false);
  const [data, setData] = useState(todos);
  const [added, setAdded] = useState(0);

  const handleSave = () => {
    //validation
    for (let todo of data) {
      console.log(todo);
      if (todo.title == "") {
        window.alert("Todo title cannot be blank..");
        return;
      }
    }
    const projectSocket = projectSocketRef.current;
    projectSocket.emit("updateTodos", data);
    setAdded(0);
    setShowModal(false);
  };
  const handleAdd = () => {
    // add empty object
    const newData = produce(data, (draft) => {
      draft.push({ title: "" });
    });
    setData(newData);
    setAdded(added + 1);
  };
  const removeAdd = () => {
    if (added == 0) {
      console.log("Don't delete existing to do here");
      return;
    }
    const newData = produce(data, (draft) => {
      draft.pop();
    });
    setData(newData);
    setAdded(added - 1);
  };

  return (
    <>
      <button
        className="border  hover:bg-blue-500 hover:text-white hover:font-bold p-2 rounded"
        type="button"
        onClick={() => setShowModal(true)}
      >
        Update Todos
      </button>
      {showModal ? (
        <>
          <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
            <div className="relative w-auto my-6 mx-auto p-3 max-w-[400px]">
              {/*content*/}
              <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                {/*header*/}
                <div className="flex items-start justify-between p-5 border-b border-solid border-slate-200 rounded-t">
                  <h3 className="text-3xl font-semibold">Update Todo</h3>
                  <button
                    className="p-1 ml-auto bg-transparent border-0 float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                    onClick={() => setShowModal(false)}
                  >
                    <span className="h-6 w-6 text-red-400 text-2xl block outline-none focus:outline-none">
                      X
                    </span>
                  </button>
                </div>
                {/*body*/}
                <div className="relative p-6 flex-auto">
                  {data.length > 0 &&
                    data.map((todo, index) => {
                      return (
                        <UpdateField
                          key={index}
                          index={index}
                          _todo={todo}
                          data={data}
                          setData={setData}
                          projectSocketRef={projectSocketRef}
                        />
                      );
                    })}
                  <div className="flex flex-row gap-2 justify-center items-center m-3">
                    <button
                      onClick={handleAdd}
                      className="p-0 w-10 h-8 bg-gray-500 rounded-full hover:bg-gray-400 active:shadow-lg mouse shadow transition ease-in duration-200 focus:outline-none"
                    >
                      <svg
                        viewBox="0 0 20 20"
                        enableBackground="new 0 0 20 20"
                        className="w-6 h-6 inline-block"
                      >
                        <path
                          fill="#FFFFFF"
                          d="M16,10c0,0.553-0.048,1-0.601,1H11v4.399C11,15.951,10.553,16,10,16c-0.553,0-1-0.049-1-0.601V11H4.601
                                    C4.049,11,4,10.553,4,10c0-0.553,0.049-1,0.601-1H9V4.601C9,4.048,9.447,4,10,4c0.553,0,1,0.048,1,0.601V9h4.399
                                    C15.952,9,16,9.447,16,10z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={removeAdd}
                      className={
                        added == 0
                          ? "p-0 w-10 h-8 bg-gray-400 rounded-full hover:bg-gray-400 active:shadow-lg mouse shadow transition ease-in duration-200 focus:outline-none"
                          : "p-0 w-10 h-8 bg-gray-500 rounded-full hover:bg-gray-400 active:shadow-lg mouse shadow transition ease-in duration-200 focus:outline-none"
                      }
                    >
                      <svg
                        viewBox="0 0 20 20"
                        enableBackground="new 0 0 20 20"
                        className="w-6 h-6 inline-block"
                      >
                        <path
                          fill="#FFFFFF"
                          d="M16,10c0,0.553-0.048,1-0.601,1H4.601C4.049,11,4,10.553,4,10c0-0.553,0.049-1,0.601-1H15.399C15.952,9,16,9.447,16,10z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
                {/*footer*/}
                <div className="flex items-center justify-end p-6 border-t border-solid border-slate-200 rounded-b">
                  <button
                    className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                    type="button"
                    onClick={() => setShowModal(false)}
                  >
                    Close
                  </button>
                  <button
                    className="bg-emerald-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                    type="button"
                    onClick={handleSave}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
        </>
      ) : null}
    </>
  );
}
