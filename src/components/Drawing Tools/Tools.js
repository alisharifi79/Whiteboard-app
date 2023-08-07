import React from "react";
import styles from './Tools.module.css';

const Tools = (props) => {


    const handleToolChange = (tool) => {
        props.setTol(tool);}
 

  const clearBoard = () => {
    props.setClearBoardHandler();
  };

  return (
    <div className={styles.drawingTools}>
      <button
        className={styles.header}
        onClick={() => handleToolChange(null)}
      >
        Tools
      </button>
      <button
        className={styles.drawingButton}
        onClick={() => handleToolChange("square")}
      >
        Square
      </button>
      <button
        className={styles.drawingButton}
        onClick={() => handleToolChange("line")}
      >
        Line
      </button>
      <button
        className={styles.drawingButton}
        onClick={() => handleToolChange("drag")}
      >
        Drag
      </button>
      <button className={styles.clearButton} onClick={clearBoard}>
        Clear
      </button>
    </div>
  );
}

export default Tools;
