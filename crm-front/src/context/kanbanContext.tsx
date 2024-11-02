'use client';
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { DroppersByProject, CardsByDropper } from '@/@types/fetchProjects';
import { RequestCard, RequestDropper, CardItems, DroppersItems, ModalItem, newDroppersItem, newCardItem } from '@/@types/kanbanBoardTypes';
import { DragEndEvent, DragStartEvent, UniqueIdentifier } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { feachDroppersbyProject, updateDroppersbyProject } from '@/app/(routes)/home/projects';

 export interface KanbanContextType {
  items: DroppersByProject[];
  selectedItem: ModalItem | null;
  activeId: UniqueIdentifier | null;
  activeType: 'container' | 'card' | null;
  addCard: (idDropper: number|undefined, addCard: newCardItem) => void;
  addDropper: (dropper: newDroppersItem) => void;
  updateCard: (updatedCard: CardsByDropper) => void;
  handleCardClick: (item: ModalItem) => void;
  handleCloseModal: () => void;
  handleDragStart: (event: DragStartEvent) => void;
  handleDragEnd: (event: DragEndEvent) => void;
}

const KanbanContext = createContext<KanbanContextType | undefined>(undefined);

interface KanbanProviderProps {
  children: ReactNode;
  initialDroppers?: DroppersByProject[];
}

export const  KanbanProvider = ({ children, initialDroppers }: KanbanProviderProps) => {
  const [items, setItems] = useState<DroppersByProject[]>(initialDroppers || []);
  const [selectedItem, setSelectedItem] = useState<ModalItem | null>(null);
  const [ cards, setCards ] = useState<RequestCard[]>([]);
  const [ droppers, setDroppers ] = useState<RequestDropper[]>([]);
  const [deleteCard, setDeleteCard] = useState<number[]>([]);
  const [deleteDropper, setDeleteDropper] = useState<number[]>([]);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [activeType, setActiveType] = useState<'container' | 'card' | null>(null);


  const addCard = async(idDropper: number, newCard: newCardItem) => {
    setItems((prev) => prev.map(dropper => 
      dropper.idDropper === idDropper
        ? { ...dropper, cards: [...dropper.cards, newCard] }
        : dropper
    ));
    const updatedCard = [
      ...cards,
      {
        title: newCard.titleCard,
        position: newCard.positionCard,
        content: newCard.contentCard,
        fk_dropper: idDropper,
      },
    ];
    setCards(updatedCard);
    await updateDroppersbyProject(droppers, updatedCard, deleteCard, deleteDropper);
    const response = await feachDroppersbyProject(1);
    setItems(response.droppers);
  };

  const addDropper = async(dropper: newDroppersItem) => {
    setItems((prev) => [...prev, { titleDropper: dropper.titleDropper, positionDropper: dropper.positionDropper, cards: [] }]);
    const updatedDroppers = [
      ...droppers,
      {
        title: dropper.titleDropper,
        position: dropper.positionDropper,
        fk_project: 1,
      },
    ];
    
    setDroppers(updatedDroppers);
    await updateDroppersbyProject(updatedDroppers, cards, deleteCard, deleteDropper);
    const response = await feachDroppersbyProject(1);
    setItems(response.droppers);
  };

  const updateCard = (idDropper: number, updatedCard: CardItems) => {
    setItems((prev) => prev.map(container => ({
      ...container,
      cards: container.cards.map(card => 
        card.idCard === updatedCard.idCard ? updatedCard : card
      )
    })));
    setCards((prev) => prev.map(card => 
      card.idCard === updatedCard.idCard ? { idCard: updatedCard.idCard, idDropper: idDropper, titleCard: updatedCard.titleCard, contentCard: updatedCard.contentCard, positionCard: updatedCard.positionCard } : card
    ));
  };

  const handleCardClick = (item: ModalItem) => {
    setSelectedItem(item);
  };

  const handleCloseModal = () => {
    setSelectedItem(null);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id);
    setActiveType(items.some(item => item.id === active.id) ? 'container' : 'card');
  };

  const handleDragEnd = (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
          setItems((prev) => {
          const activeContainerIndex = prev.findIndex((container) => container.id === active.id);
          const overContainerIndex = prev.findIndex((container) => container.id === over.id);

          if (activeContainerIndex !== -1 && overContainerIndex !== -1) {
              return arrayMove(prev, activeContainerIndex, overContainerIndex);
          }

          const activeCardContainerIndex = prev.findIndex((container) =>
              container.cards.some((card) => card.id === active.id)
          );
          const overCardContainerIndex = prev.findIndex((container) =>
              container.id === over.id || container.cards.some((card) => card.id === over.id)
          );

          if (activeCardContainerIndex !== overCardContainerIndex) {
              const activeContainer = prev[activeCardContainerIndex];
              const overContainer = prev[overCardContainerIndex];
              const activeCardIndex = activeContainer.cards.findIndex((card) => card.id === active.id);
              const overCardIndex = overContainer.cards.findIndex((card) => card.id === over.id);

              const newItems = [...prev];
              const [movedCard] = newItems[activeCardContainerIndex].cards.splice(activeCardIndex, 1);
              newItems[overCardContainerIndex].cards.splice(
              overCardIndex >= 0 ? overCardIndex : newItems[overCardContainerIndex].cards.length,
              0,
              { ...movedCard, status: newItems[overCardContainerIndex].title }
              );

              return newItems;
          } else {
              const containerIndex = activeCardContainerIndex;
              const oldIndex = prev[containerIndex].cards.findIndex((card) => card.id === active.id);
              const newIndex = prev[containerIndex].cards.findIndex((card) => card.id === over.id);

              return prev.map((container, index) => {
              if (index === containerIndex) {
                  return {
                  ...container,
                  cards: arrayMove(container.cards, oldIndex, newIndex),
                  };
              }
              return container;
              });
          }
          });
      }

      setActiveId(null);
      setActiveType(null);
      };

  return (
    <KanbanContext.Provider value={{
      items,
      selectedItem,
      activeId,
      activeType,
      addCard,
      addDropper,
      updateCard,
      handleCardClick,
      handleCloseModal,
      handleDragStart,
      handleDragEnd
    }}>
      {children}
    </KanbanContext.Provider>
  );
}

export function useKanban() {
  const context = useContext(KanbanContext);
  if (context === undefined) {
    throw new Error('useKanban must be used within a KanbanProvider');
  }
  return context;
}