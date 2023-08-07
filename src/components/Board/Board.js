import React, { useRef, useEffect, useState } from "react";

import Card from "../UI/Card";
import styles from "./Board.module.css";
import Tools from "../Drawing Tools/Tools";

const Board = () => {
  const canvasRef = useRef(null);
  const [ctx, setCtx] = useState(null);
  const [drawings, setDrawings] = useState([]);
  const [currentDrawing, setCurrentDrawing] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedTool, setSelectedTool] = useState(null);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartY, setDragStartY] = useState(0);
  const [draggedShapeIndex, setDraggedShapeIndex] = useState(-1);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    context.strokeStyle = "black";
    context.lineWidth = 2;
    setCtx(context);
  }, []);

  const clearBoard = () => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    setDrawings([]);
  };

  const storeTool = (tool) => {
    setSelectedTool(tool);
  }

  const startDrawing = (type, x, y) => {
    if (type === "line") {
      setCurrentDrawing({ type, x1: x, y1: y, x2: x, y2: y, id: Date.now() });
    } else if (type === "square") {
      setCurrentDrawing({ type, x, y, width: 0, height: 0, id: Date.now() });
    }
    setIsDrawing(true);
  };

  const stopDrawing = () => {
    if (currentDrawing && isDrawing) {
      if (draggedShapeIndex >= 0) {
        // The dragged shape has already been updated during dragging,
        // so we don't need to do anything here.
      } else {
        // Check if the current drawing is already in the drawings state

        setDrawings((prevDrawings) => [...prevDrawings, currentDrawing]);
      }
    }

    setCurrentDrawing(null);
    setIsDrawing(false);
    setIsDragging(false);
    setDraggedShapeIndex(-1); // Reset the draggedShapeIndex
  };

  const drawDrawings = () => {
    for (const drawing of drawings) {
      if (drawing.type === "square") {
        ctx.strokeRect(drawing.x, drawing.y, drawing.width, drawing.height);
      } else if (drawing.type === "line") {
        ctx.beginPath();
        ctx.moveTo(drawing.x1, drawing.y1);
        ctx.lineTo(drawing.x2, drawing.y2);
        ctx.stroke();
      }
    }
  };

  const startDragging = (x, y) => {
    for (let i = drawings.length - 1; i >= 0; i--) {
      const drawing = drawings[i];
      //handle neg wid or hei
      if (drawing.type === "square") {
        const isBothPos =
          x >= drawing.x &&
          x <= drawing.x + drawing.width &&
          y >= drawing.y &&
          y <= drawing.y + drawing.height;
        const isWidPos =
          x >= drawing.x &&
          x <= drawing.x + drawing.width &&
          y <= drawing.y &&
          y >= drawing.y + drawing.height;
        const isWidNeg =
          x <= drawing.x &&
          x >= drawing.x + drawing.width &&
          y >= drawing.y &&
          y <= drawing.y + drawing.height;
        const isBothNeg =
          x <= drawing.x &&
          x >= drawing.x + drawing.width &&
          y <= drawing.y &&
          y >= drawing.y + drawing.height;

        if (isBothPos || isWidPos || isWidNeg || isBothNeg) {
          // Store the starting position relative to the shape's top-left corner
          setDragStartX(x - drawing.x);
          setDragStartY(y - drawing.y);
          setCurrentDrawing(drawing);
          setIsDragging(true);
          setIsDrawing(false);
          setDraggedShapeIndex(i); // Set the index of the dragged shape
        }
      } else if (drawing.type === "line") {
        const { x1, y1, x2, y2 } = drawing;
        const distanceToLine = pointToLineDistance(x, y, x1, y1, x2, y2);
  
        if (distanceToLine < 15) { // Adjust the tolerance value (5) as needed for precision
          setDragStartX(x);
          setDragStartY(y);
          setCurrentDrawing(drawing);
          setIsDragging(true);
          setIsDrawing(false);
          setDraggedShapeIndex(i); // Set the index of the dragged shape
          break;
        }
      }
    }
  };
  
  const pointToLineDistance = (x, y, x1, y1, x2, y2) => {
    const A = x - x1;
    const B = y - y1;
    const C = x2 - x1;
    const D = y2 - y1;
  
    const dot = A * C + B * D;
    const len_sq = C * C + D * D;
    const param = dot / len_sq;
  
    let xx, yy;
  
    if (param < 0) {
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }
  
    const dx = x - xx;
    const dy = y - yy;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const drawDraggedShape = (event) => {
    if (isDragging && currentDrawing) {
      const { offsetX, offsetY } = event.nativeEvent || event;
      const { type } = currentDrawing;

      // Calculate the change in position based on mouse movement
      const deltaX = offsetX - dragStartX;
      const deltaY = offsetY - dragStartY;

      // Clear the entire canvas
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      // Draw all existing drawings except the current drawing (to avoid duplicates)
      for (const drawing of drawings) {
        if (drawing.id !== currentDrawing.id) {
          if (drawing.type === "square") {
            ctx.strokeRect(drawing.x, drawing.y, drawing.width, drawing.height);
          } else if (drawing.type === "line") {
            ctx.beginPath();
            ctx.moveTo(drawing.x1, drawing.y1);
            ctx.lineTo(drawing.x2, drawing.y2);
            ctx.stroke();
          }
        }
      }
      // Draw the current drawing at its new position
      if (type === "square") {
        ctx.strokeRect(
          currentDrawing.x + deltaX,
          currentDrawing.y + deltaY,
          currentDrawing.width,
          currentDrawing.height
        );
        setDrawings((prevDrawings) =>
          prevDrawings.map((drawing) =>
            drawing.id === currentDrawing.id
              ? {
                  ...drawing,
                  x: currentDrawing.x + deltaX,
                  y: currentDrawing.y + deltaY,
                }
              : drawing
          )
        );
      } else if (type === "line") {
        ctx.beginPath();
        ctx.moveTo(currentDrawing.x1 + deltaX, currentDrawing.y1 + deltaY);
        ctx.lineTo(currentDrawing.x2 + deltaX, currentDrawing.y2 + deltaY);
        setDrawings((prevDrawings) =>
        prevDrawings.map((drawing) =>
        drawing.id === currentDrawing.id
              ? {
                ...drawing,
                  x1: currentDrawing.x1 + deltaX,
                  y1: currentDrawing.y1 + deltaY,
                  x2: currentDrawing.x2 + deltaX,
                  y2: currentDrawing.y2 + deltaY,
                }
                : drawing
                )
                );
                ctx.stroke();
      }
    }
  };

  const drawSquare = (event) => {
    if (isDrawing && !isDragging) {
      // Only update the currentDrawing state if it's a new shape being drawn,
      // not when the shape is being dragged
      if (draggedShapeIndex === -1) {
        const { offsetX, offsetY } = event.nativeEvent || event;
        const { x, y } = currentDrawing;

        // Set the global composite operation to "source-over" to preserve black pixels and make the background transparent
        ctx.globalCompositeOperation = "source-over";

        // Clear the entire canvas
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // Draw all existing drawings
        drawDrawings();

        // Draw the current square
        const width = offsetX - x;
        const height = offsetY - y;
        setCurrentDrawing((prevDrawing) => ({ ...prevDrawing, width, height }));
        ctx.strokeRect(x, y, width, height);

        // Reset the global composite operation to the default
        ctx.globalCompositeOperation = "source-over";
      }
    }
  };

  const drawLine = (event) => {
    if (isDrawing && !isDragging) {
      // Only update the currentDrawing state if it's a new shape being drawn,
      // not when the shape is being dragged
      if (draggedShapeIndex === -1) {
        const { offsetX, offsetY } = event.nativeEvent || event;
        setCurrentDrawing((prevDrawing) => ({
          ...prevDrawing,
          x2: offsetX,
          y2: offsetY,
        }));

        // Set the global composite operation to "source-over" to preserve black pixels and make the background transparent
        ctx.globalCompositeOperation = "source-over";

        // Clear the entire canvas
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // Draw all existing drawings
        drawDrawings();

        // Draw the current line
        ctx.beginPath();
        ctx.moveTo(currentDrawing.x1, currentDrawing.y1);
        ctx.lineTo(offsetX, offsetY);
        ctx.stroke();

        // Reset the global composite operation to the default
        ctx.globalCompositeOperation = "source-over";
      }
    }
  };

  const handleCanvasMouseDown = (event) => {
    const { offsetX, offsetY } = event.nativeEvent || event;
    if (!isDragging && selectedTool) {
      if (selectedTool === "drag") {
        for (let i = drawings.length - 1; i >= 0; i--) {
          const drawing = drawings[i];
          if (
            offsetX >= drawing.x &&
            offsetX <= drawing.x + drawing.width &&
            offsetY >= drawing.y &&
            offsetY <= drawing.y + drawing.height
          ) {
            setDraggedShapeIndex(i);
            setCurrentDrawing(drawing);
            setIsDragging(true);
            setIsDrawing(false);
            setDragStartX(offsetX - drawing.x);
            setDragStartY(offsetY - drawing.y);
            break;
          }
        }
      } else {
        setCurrentDrawing(null);
        startDrawing(selectedTool, offsetX, offsetY);
      }
    }
  };

  return (
    <Card className={styles.board}>
    <Tools setTol = {storeTool} setClearBoardHandler={clearBoard}/>
      <Card>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        width="1000"
        height="800"
        onMouseDown={(event) => {
          if (selectedTool === "drag") {
            const { offsetX, offsetY } = event.nativeEvent || event;
            startDragging(offsetX, offsetY);
            // Store the initial mouse position for calculating the change in position during dragging
            setDragStartX(offsetX);
            setDragStartY(offsetY);
          } else {
            handleCanvasMouseDown(event);
          }
        }}
        onMouseMove={(event) => {
          if (selectedTool === "drag") {
            drawDraggedShape(event);
          } else {
            if (selectedTool === "square") {
              drawSquare(event);
            } else if (selectedTool === "line") {
              drawLine(event);
            }
          }
        }}
        onMouseUp={() => {
          stopDrawing();
        }}
        onMouseLeave={() => {
          setIsDragging(false);
          if (selectedTool !== "drag") {
            stopDrawing();
          }
        }}
      />
      </Card>
    </Card>
  );
};

export default Board;
