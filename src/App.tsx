import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  UniqueIdentifier,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useState } from "react";
import { SortableItem } from "./components/SortableItem";
import "./App.css";
import { createPortal } from "react-dom";

function App() {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

  const [data, setData] = useState(
    Array.from({ length: 5 }, (_, index) => ({
      id: `item-${index}`,
      content: `Item ${index + 1}`,
      subItems: Array.from({ length: 3 }, (_, subIndex) => ({
        id: `sub-item-${index}-${subIndex}`,
        content: `Sub Item ${index + 1}.${subIndex + 1}`,
      })),
    }))
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over?.id) return;
    if (active.id === over.id) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const source = activeId.split("-");
    const destination = overId.split("-");

    if (source.length === 2 && destination.length === 2) {
      const sourceIndex = data.findIndex(({ id }) => id === active.id);
      const destinationIndex = data.findIndex(({ id }) => id === over.id);

      const updatedData = [...data];
      const [movedItem] = updatedData.splice(sourceIndex, 1);
      updatedData.splice(destinationIndex, 0, movedItem);

      setData(updatedData);
    } else if (source.length === 4 && destination.length === 4) {
      setData((prevData) => {
        const updatedData = [...prevData];
        const sourceItemIndex = updatedData.findIndex(
          ({ id }) => id === `item-${source[2]}`
        );
        const destinationItemIndex = updatedData.findIndex(
          ({ id }) => id === `item-${destination[2]}`
        );

        const sourceItem = updatedData[sourceItemIndex];
        const destinationItem = updatedData[destinationItemIndex];

        const sourceSubItemIndex = sourceItem.subItems.findIndex(
          ({ id }) => id === active.id
        );
        const destinationSubItemIndex = destinationItem.subItems.findIndex(
          ({ id }) => id === over.id
        );

        const [movedItem] = sourceItem.subItems.splice(sourceSubItemIndex, 1);
        destinationItem.subItems.splice(destinationSubItemIndex, 0, movedItem);

        return updatedData;
      });

      setActiveId(null);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!over) return;
    if (active.id === over.id) return;

    const activeContainer =
      data.find(({ id }) => id === active.id) ??
      data.find(({ subItems }) => subItems.some(({ id }) => id === active.id));
    const overContainer =
      data.find(({ id }) => id === over.id) ??
      data.find(({ subItems }) => subItems.some(({ id }) => id === over.id));

    if (!activeContainer || !overContainer) return;
    if (activeContainer.id === overContainer.id) return;

    setData((prevData) => {
      const updatedData = [...prevData];
      const sourceItemIndex = updatedData.findIndex(({ subItems }) =>
        subItems.some(({ id }) => id === active.id)
      );
      const destinationItemIndex = updatedData.findIndex(({ subItems }) =>
        subItems.some(({ id }) => id === over.id)
      );

      const sourceItem = updatedData[sourceItemIndex].subItems.find(
        ({ id }) => id === active.id
      );

      updatedData[sourceItemIndex].subItems = updatedData[
        sourceItemIndex
      ].subItems.filter((item) => item.id !== active.id);
      updatedData[destinationItemIndex].subItems.unshift(sourceItem!);

      return updatedData;
    });
  };

  return (
    <main className="main">
      <DndContext
        collisionDetection={closestCenter}
        sensors={sensors}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragStart={(event) => setActiveId(event.active.id)}
        onDragCancel={() => setActiveId(null)}
      >
        <SortableContext
          items={data.map(({ id }) => id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="container">
            {data.map(({ id, content, subItems }) => (
              <SortableItem key={id} id={id}>
                <h2>{content}</h2>

                <SortableContext
                  items={subItems.map(({ id }) => id)}
                  strategy={rectSortingStrategy}
                >
                  <div className="sub-container">
                    {subItems.map(({ id, content }) => (
                      <SortableItem key={id} id={id}>
                        <p>{content}</p>
                      </SortableItem>
                    ))}
                  </div>
                </SortableContext>
              </SortableItem>
            ))}
          </div>
        </SortableContext>

        {createPortal(
          activeId ? (
            <DragOverlay>
              <SortableItem
                dragging

                id={activeId.toString()}
                children={
                  data.some(({ id }) => id === activeId) ? (
                    <h2>
                      {
                        data.find(({ id }) => id === activeId)?.content
                      }
                    </h2>
                  ) : (
                    <p>
                      
                      {
                        data.find(({ subItems }) =>
                          subItems.some(({ id }) => id === activeId)
                        )?.subItems.find(({ id }) => id === activeId)?.content
                      }
                    </p>
                  )
                }
              />
            </DragOverlay>
          ) : null,
          document.body
        )}
      </DndContext>
    </main>
  );
}

export default App;
