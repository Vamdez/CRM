import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';

interface PropsDragBox {
  id: number;
  children: React.ReactNode;
}

const DragBox : React.FC<PropsDragBox> = ({ id, children }) => {
  const {attributes, listeners, setNodeRef, transform, isDragging} = useSortable({
    id: id+"Card",
    data: {
      type:"card",
      id: id
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    zIndex: isDragging ? 1000 : 'auto',
    opacity: isDragging ? 0.5 : 1,
    position: 'relative' as 'relative',
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="w-full mb-2">
      {children}
    </div>
  );
};

export default DragBox;