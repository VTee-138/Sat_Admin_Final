import React, { useRef, useState } from "react";
import { Button, Checkbox, TextField } from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import MathRenderer from "./MathRenderer";
import { v4 as uuidv4 } from "uuid";
import Slide from "@mui/material/Slide";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function ViewExam({ openDialog, setOpenDialog, questionsData }) {
  const handleViewExam = () => {
    if (questionsData?.length > 0) {
      return questionsData.map((q, index) => {
        const { question, contentQuestions, type, imageUrl, subQuestion } = q;
        switch (type) {
          case "TN":
            return (
              <div
                id={question}
                className="mx-auto relative mt-4 page p-[30px] bg-gray-300 hover:bg-gray-200 rounded-[24px] opacity-100 shadow-lg text-black"
              >
                <h2 className="heading text-left text-[1.2rem] mb-2 question-label font-bold">
                  {question}:
                </h2>
                <span className="question-content text-[18px]">
                  <MathRenderer content={contentQuestions} />
                </span>
                {subQuestion && (
                  <span className="question-content text-[18px]">
                    <MathRenderer content={subQuestion} />
                  </span>
                )}

                <div>
                  {" "}
                  {imageUrl && (
                    <img
                      src={imageUrl}
                      alt={`10SAT-${uuidv4()}`}
                      className="lg:w-[35%] md:w-[40%] sm:w-[60%] w-[70%] m-auto"
                    ></img>
                  )}
                </div>
                <p className="text-red-500 mt-5 font-bold">
                  Đáp án đúng: {q.correctAnswer}
                </p>
                <div className="grid grid-cols-2 gap-4 mt-5 text-black">
                  <div className="flex items-center">
                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-500 text-white font-bold">
                      A
                    </div>
                    <span className="ml-3 manrope-font-size">
                      <MathRenderer content={q?.contentAnswerA} />
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-green-500 text-white font-bold">
                      B
                    </div>
                    <span className="ml-3 manrope-font-size">
                      <MathRenderer content={q?.contentAnswerB} />
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-yellow-500 text-white font-bold">
                      C
                    </div>
                    <span className="ml-3 manrope-font-size">
                      <MathRenderer content={q?.contentAnswerC} />
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-red-500 text-white font-bold">
                      D
                    </div>
                    <span className="ml-3 manrope-font-size">
                      <MathRenderer content={q?.contentAnswerD} />
                    </span>
                  </div>
                </div>

                {/* Explanation section */}
                {q?.explanation && (
                  <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
                    <h3 className="text-lg font-semibold text-blue-800 mb-2">
                      📝 Explanation:
                    </h3>
                    <div className="text-gray-700 text-[16px]">
                      <MathRenderer content={q.explanation} />
                    </div>
                  </div>
                )}
              </div>
            );

            return (
              <div
                id={question}
                className="mx-auto relative mt-4 page p-[30px] bg-gray-300 hover:bg-gray-200 rounded-[24px] opacity-100 shadow-lg text-black"
              >
                <h2 className="heading text-left text-[1.2rem] mb-2 question-label font-bold">
                  {question}:
                </h2>
                <span className="question-content text-[18px]">
                  <MathRenderer content={contentQuestions} />
                </span>
                <div>
                  {" "}
                  {imageUrl && (
                    <img
                      src={imageUrl}
                      alt={`10SAT-${uuidv4()}`}
                      className="w-[70%] m-auto"
                    ></img>
                  )}
                </div>
                <DragDropContext>
                  <div className="container mx-auto p-6">
                    <div key={question} className="mb-8">
                      <Droppable droppableId={question}>
                        {(provided) => (
                          <div
                            // ref={provided.innerRef}
                            // {...provided.droppableProps}
                            className="p-2 rounded mt-2 min-h-[50px] w-[100%] border-2 border-dashed border-teal-600"
                          >
                            <div className="flex flex-wrap lg:space-x-2">
                              {q?.items?.map((item, index) => (
                                <Draggable>
                                  {(provided) => (
                                    <div
                                      //   ref={provided.innerRef}
                                      //   {...provided.draggableProps}
                                      //   {...provided.dragHandleProps}
                                      className={
                                        "bg-blue-500 text-white p-2 min-w-16 rounded text-center mr-2 lg:mt-0 mt-2 manrope-font-size"
                                      }
                                    >
                                      <MathRenderer content={item?.content} />
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                            </div>
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>

                      <div className="mt-4">
                        {q?.contentY1 && (
                          <div className="flex items-center space-x-4 mb-4">
                            <div className="flex manrope-font-size">
                              <strong>1) </strong>&nbsp; &nbsp;
                              <MathRenderer content={q?.contentY1} />
                            </div>
                            <Droppable droppableId="slot1">
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.droppableProps}
                                  className="p-2 rounded min-h-[50px] lg:w-[10%] w-[30%] border-2 border-dashed border-teal-600"
                                >
                                  {q?.answers?.slot1 && (
                                    <div className="bg-blue-500 text-white p-2 w-16 rounded text-center">
                                      <MathRenderer
                                        content={q?.answers?.slot1?.content}
                                      />
                                    </div>
                                  )}
                                  {provided.placeholder}
                                </div>
                              )}
                            </Droppable>
                          </div>
                        )}
                        {q?.contentY2 && (
                          <div className="flex items-center space-x-4 mb-4">
                            <div className="flex manrope-font-size">
                              <strong>2) </strong>&nbsp; &nbsp;
                              <MathRenderer content={q?.contentY2} />{" "}
                            </div>

                            <Droppable droppableId="slot2">
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.droppableProps}
                                  className="p-2 rounded min-h-[50px] lg:w-[10%] w-[30%] border-2 border-dashed border-teal-600"
                                >
                                  {q?.answers?.slot2 && (
                                    <div className="bg-blue-500 text-white p-2 w-16 rounded text-center">
                                      <MathRenderer
                                        content={q?.answers?.slot2?.content}
                                      />
                                    </div>
                                  )}
                                  {provided.placeholder}
                                </div>
                              )}
                            </Droppable>
                          </div>
                        )}

                        {q?.contentY3 && (
                          <div className="flex items-center space-x-4 mb-4">
                            <div className="flex manrope-font-size">
                              <strong>3) </strong>&nbsp; &nbsp;
                              <MathRenderer content={q?.contentY3} />
                            </div>

                            <Droppable droppableId="slot3">
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.droppableProps}
                                  className="p-2 rounded min-h-[50px] lg:w-[10%] w-[30%] border-2 border-dashed border-teal-600"
                                >
                                  {q?.answers?.slot3 && (
                                    <div className="bg-blue-500 text-white p-2 w-16 rounded text-center">
                                      <MathRenderer
                                        content={q?.answers?.slot3?.content}
                                      />
                                    </div>
                                  )}
                                  {provided.placeholder}
                                </div>
                              )}
                            </Droppable>
                          </div>
                        )}

                        {q?.contentY4 && (
                          <div className="flex items-center space-x-4 mb-4">
                            <div className="flex manrope-font-size">
                              <strong>4) </strong>&nbsp; &nbsp;
                              <MathRenderer content={q?.contentY4} />
                            </div>
                            <Droppable droppableId="slot4">
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.droppableProps}
                                  className="p-2 rounded min-h-[50px] lg:w-[10%] w-[30%] border-2 border-dashed border-teal-600"
                                >
                                  {q?.answers?.slot4 && (
                                    <div className="bg-blue-500 text-white p-2 w-16 rounded text-center">
                                      <MathRenderer
                                        content={q?.answers?.slot4?.content}
                                      />
                                    </div>
                                  )}
                                  {provided.placeholder}
                                </div>
                              )}
                            </Droppable>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </DragDropContext>

                {/* Explanation section for KT */}
                {q?.explanation && (
                  <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
                    <h3 className="text-lg font-semibold text-blue-800 mb-2">
                      📝 Explanation:
                    </h3>
                    <div className="text-gray-700 text-[16px]">
                      <MathRenderer content={q.explanation} />
                    </div>
                  </div>
                )}
              </div>
            );
          case "TLN":
            return (
              <div
                id={question}
                className="mx-auto relative mt-4 page p-[30px] bg-gray-300 hover:bg-gray-200 rounded-[24px] opacity-100 shadow-lg text-black"
              >
                <h2 className="heading text-left text-[1.2rem] mb-2 question-label font-bold">
                  {question}:
                </h2>
                <span className="question-content text-[18px]">
                  <MathRenderer content={contentQuestions} />
                </span>
                <div>
                  {" "}
                  {imageUrl && (
                    <img
                      src={imageUrl}
                      alt={`10SAT-${uuidv4()}`}
                      className="lg:w-[35%] md:w-[40%] sm:w-[60%] w-[70%] m-auto"
                    ></img>
                  )}
                </div>
                <p className="text-red-500 mt-5 font-bold">
                  Đáp án đúng:{" "}
                  {Array.isArray(q.correctAnswer)
                    ? q.correctAnswer.join(";")
                    : q.correctAnswer}
                </p>
                {/* Explanation section for TLN */}
                {q?.explanation && (
                  <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
                    <h3 className="text-lg font-semibold text-blue-800 mb-2">
                      📝 Explanation:
                    </h3>
                    <div className="text-gray-700 text-[16px]">
                      <MathRenderer content={q.explanation} />
                    </div>
                  </div>
                )}
              </div>
            );

            return (
              <div
                id={question}
                className="mx-auto relative mt-4 page p-[30px] bg-gray-300 hover:bg-gray-200 rounded-[24px] opacity-100 shadow-lg text-black"
              >
                <h2 className="text-[18px] font-bold italic mb-5">{q.title}</h2>
                <span className="question-content text-[18px]">
                  <MathRenderer content={contentQuestions} />
                </span>
                <div>
                  {" "}
                  {imageUrl && (
                    <img
                      src={imageUrl}
                      alt={`10SAT-${uuidv4()}`}
                      className="lg:w-[35%] md:w-[40%] sm:w-[60%] w-[70%] m-auto"
                    ></img>
                  )}
                </div>
                <div>
                  {q?.contentC1 && (
                    <div className="flex items-center">
                      <Checkbox
                        disabled
                        sx={{ "& .MuiSvgIcon-root": { fontSize: 28 } }}
                      />{" "}
                      <MathRenderer content={q?.contentC1} />
                    </div>
                  )}
                  {q?.contentC2 && (
                    <div className="flex items-center">
                      <Checkbox
                        disabled
                        sx={{ "& .MuiSvgIcon-root": { fontSize: 28 } }}
                      />{" "}
                      <MathRenderer content={q?.contentC2} />
                    </div>
                  )}
                  {q?.contentC3 && (
                    <div className="flex items-center">
                      <Checkbox
                        disabled
                        sx={{ "& .MuiSvgIcon-root": { fontSize: 28 } }}
                      />{" "}
                      <MathRenderer content={q?.contentC3} />
                    </div>
                  )}
                  {q?.contentC4 && (
                    <div className="flex items-center">
                      <Checkbox
                        disabled
                        sx={{ "& .MuiSvgIcon-root": { fontSize: 28 } }}
                      />{" "}
                      <MathRenderer content={q?.contentC4} />
                    </div>
                  )}
                </div>

                {/* Explanation section for MA */}
                {q?.explanation && (
                  <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
                    <h3 className="text-lg font-semibold text-blue-800 mb-2">
                      📝 Explanation:
                    </h3>
                    <div className="text-gray-700 text-[16px]">
                      <MathRenderer content={q.explanation} />
                    </div>
                  </div>
                )}
              </div>
            );
          default:
            return null;
        }
      });
    }
    return null;
  };
  return (
    <Dialog
      open={openDialog}
      TransitionComponent={Transition}
      keepMounted
      onClose={() => setOpenDialog(false)}
      aria-describedby="alert-dialog-slide-description"
      maxWidth={"lg"}
    >
      <DialogContent>
        <DialogContentText id="alert-dialog-slide-description">
          {handleViewExam()}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
        <Button onClick={() => setOpenDialog(false)}>Ok</Button>
      </DialogActions>
    </Dialog>
  );
}
