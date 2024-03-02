import { useSortable } from "@dnd-kit/sortable";
import "./styles.css";

interface SortableItemProps extends React.HTMLAttributes<HTMLDivElement> {
  id: string;
  dragging?: boolean;
  children: React.ReactNode;
}

export const SortableItem = ({ id, dragging, children, ...rest }: SortableItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      className="container"
      style={{
        transform: transform ? `translate3d(${transform?.x}px, ${transform?.y}px, 0)` : undefined,
        transition,
      }}
      {...rest}
    >
      <button
        {...attributes}
        {...listeners}
        style={{
          cursor: dragging ? 'grabbing' : 'grab',
          display: "inline-block",
          marginRight: 8,
        }}
      >
        Move
      </button>
      {children}
    </div>
  );
};
