import {
  CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { chakra } from "@chakra-ui/react";

function useCanvas(): CanvasRenderingContext2D {
  const ref = useRef<CanvasRenderingContext2D | null>(null);

  if (ref.current) return ref.current;

  const canvas = document.createElement("canvas");
  ref.current = canvas.getContext("2d");
  return ref.current as CanvasRenderingContext2D;
}

export interface TruncateProps {
  /** text to be truncated */
  text: string;
  /**
    width of the element
    @default parentNode.width
  */
  width?: number;
  /**
    the position(from the end) of the ellipsis that shows in text
    @default 8
  */
  offset?: number;
  /**
    Ellipsis that is added into the text in case it is truncated
    @default ...
  */
  ellipsis?: string;

  style?: CSSProperties;
}

/**
 * <b>Truncate</b> truncates text based on a given width. The component
    takes in a few props, including the text to be truncated, the width of
    the container, the number of characters to offset the truncated text,
    and the ellipsis to be used.
 */
function MiddleEllipsisText(props: TruncateProps) {
  const { text, width = 0, offset = 8, ellipsis = "...", style } = props;

  const [targetWidth, setTargetWidth] = useState<number>(0);
  const [shouldTruncate, setShouldTruncate] = useState<boolean>(false);
  const [truncated, setTruncated] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvas = useCanvas();

  const setupCanvas = useCallback(() => {
    if (!containerRef.current) return;

    const style = window.getComputedStyle(containerRef.current);
    const font = [
      style["font-weight"],
      style["font-style"],
      style["font-size"],
      style["font-family"],
    ].join(" ");
    canvas.font = font;
  }, [canvas]);

  const calcTargetWidth = useCallback(() => {
    let targetW: number;
    if (width) {
      targetW = width;
    } else {
      targetW = containerRef.current?.getBoundingClientRect().width || 0;
    }
    setTargetWidth(targetW);
    const measureWidth = canvas.measureText(text).width;
    setShouldTruncate(targetW < measureWidth);
    setTruncated(true);
  }, [canvas, text, width]);

  useEffect(() => {
    setupCanvas();
    calcTargetWidth();
  }, [calcTargetWidth, setupCanvas]);

  useEffect(() => {
    const oB = new ResizeObserver((entries) => {
      if (entries.length > 0) {
        calcTargetWidth();
      }
    });
    if (containerRef.current) {
      oB.observe(containerRef.current);
    }

    return () => {
      oB.disconnect();
    };
  }, [calcTargetWidth]);

  const calculatedText = useMemo(() => {
    if (!shouldTruncate) return text;

    const len = text.length;
    const tail = text.slice(len - offset, len);
    let head: string;

    let end = len - offset;
    let start = 0;

    while (start < end - 1) {
      const curr = Math.floor((end - start) / 2 + start);
      head = text.slice(0, curr);
      if (canvas.measureText(head + ellipsis + tail).width < targetWidth) {
        start = curr;
      } else {
        end = curr;
      }
    }
    head = text.slice(0, start || 1);
    return head + ellipsis + tail;
  }, [canvas, ellipsis, offset, shouldTruncate, targetWidth, text]);

  return (
    <div
      ref={containerRef}
      style={{ width: width || "100%", whiteSpace: "nowrap", ...style }}
    >
      {truncated ? calculatedText : calculatedText}
    </div>
  );
}

export default MiddleEllipsisText;
