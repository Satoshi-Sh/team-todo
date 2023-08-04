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
        id={data[index]._id}
        type="text"
        placeholder="Enter todo"
        value={data[index].title}
        onChange={handleUpdate}
      />
    </div>
  );
};

export default function TodoUpdateModal({ todos, projectSocketRef }) {
  const [showModal, setShowModal] = useState(false);
  const [data, setData] = useState(todos);

  const handleSave = () => {
    const projectSocket = projectSocketRef.current;
    projectSocket.emit("updateTodos", data);
    setShowModal(false);
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
