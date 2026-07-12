import { useState, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { Plus, Heart, Trash2, Download, Upload, Edit2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { inspirationBoard } from '@/lib/inspirationBoard';
import { haptics } from '@/lib/haptics';

interface Board {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  items: any[];
  coverImage?: string;
}

export function InspirationBoard() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [newBoardDesc, setNewBoardDesc] = useState('');

  useEffect(() => {
    loadBoards();
  }, []);

  const loadBoards = async () => {
    const allBoards = await inspirationBoard.getAllBoards();
    setBoards(allBoards);
  };

  const createBoard = async () => {
    if (!newBoardName.trim()) return;

    const board = await inspirationBoard.createBoard(newBoardName, newBoardDesc);
    setBoards([...boards, board]);
    setNewBoardName('');
    setNewBoardDesc('');
    setShowCreateModal(false);
    haptics.playSuccess();
  };

  const deleteBoard = async (boardId: string) => {
    await inspirationBoard.deleteBoard(boardId);
    setBoards(boards.filter(b => b.id !== boardId));
    if (selectedBoard?.id === boardId) {
      setSelectedBoard(null);
    }
    haptics.playInteraction('tap');
  };

  const exportBoard = async (boardId: string) => {
    const json = await inspirationBoard.exportBoard(boardId);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inspiration-board-${Date.now()}.json`;
    a.click();
    haptics.playSuccess();
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = event.target?.result as string;
        const board = await inspirationBoard.importBoard(json);
        setBoards([...boards, board]);
        haptics.playSuccess();
      } catch (error) {
        console.error('Failed to import board', error);
        haptics.playError();
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-24">
      {/* Header */}
      <div className="flex items-start justify-between mb-16">
        <div>
          <h2 className="font-serif text-6xl font-bold mb-4 tracking-tight">
            Inspiration Boards
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
            Curate your favorite pieces. Create mood boards for different spaces.
            Drag, organize, and dream about your perfect collection.
          </p>
        </div>

        <div className="flex gap-3">
          <label>
            <input
              type="file"
              accept=".json"
              onChange={handleFileImport}
              className="hidden"
            />
            <Button variant="outline" className="rounded-full" asChild>
              <span className="cursor-pointer">
                <Upload className="mr-2" size={18} />
                Import Board
              </span>
            </Button>
          </label>

          <Button
            size="lg"
            className="rounded-full px-8"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="mr-2" size={20} />
            Create Board
          </Button>
        </div>
      </div>

      {/* Boards Grid */}
      {!selectedBoard ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {boards.map((board) => (
              <motion.div
                key={board.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group cursor-pointer"
                onClick={() => {
                  setSelectedBoard(board);
                  haptics.playInteraction('tap');
                }}
              >
                <div className="relative rounded-[2.5rem] overflow-hidden aspect-[3/4] bg-card border-2 border-border/40 hover:border-primary/40 transition-all shadow-xl hover:shadow-2xl">
                  {board.coverImage ? (
                    <img
                      src={board.coverImage}
                      alt={board.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
                      <Heart size={64} className="text-primary/40" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="font-serif text-2xl font-bold text-white mb-2">
                      {board.name}
                    </h3>
                    <p className="text-sm text-white/80 mb-4">
                      {board.items.length} {board.items.length === 1 ? 'item' : 'items'}
                    </p>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="rounded-full bg-white/20 backdrop-blur-xl border-0 hover:bg-white/30"
                        onClick={(e) => {
                          e.stopPropagation();
                          exportBoard(board.id);
                        }}
                      >
                        <Download size={14} />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="rounded-full bg-white/20 backdrop-blur-xl border-0 hover:bg-white/30"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteBoard(board.id);
                        }}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {boards.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full text-center py-24"
            >
              <Heart size={64} className="mx-auto text-muted-foreground/40 mb-6" />
              <h3 className="font-serif text-3xl font-bold mb-4">No Boards Yet</h3>
              <p className="text-muted-foreground text-lg mb-8">
                Create your first inspiration board to start saving favorites
              </p>
              <Button size="lg" className="rounded-full px-10" onClick={() => setShowCreateModal(true)}>
                <Plus className="mr-2" size={20} />
                Create Your First Board
              </Button>
            </motion.div>
          )}
        </div>
      ) : (
        /* Board Detail View */
        <div>
          <div className="flex items-center justify-between mb-12">
            <div>
              <Button
                variant="ghost"
                className="rounded-full mb-4"
                onClick={() => setSelectedBoard(null)}
              >
                ← Back to Boards
              </Button>
              <h3 className="font-serif text-5xl font-bold">{selectedBoard.name}</h3>
              {selectedBoard.description && (
                <p className="text-lg text-muted-foreground mt-2">{selectedBoard.description}</p>
              )}
            </div>

            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => exportBoard(selectedBoard.id)}
            >
              <Download className="mr-2" size={18} />
              Export Board
            </Button>
          </div>

          {selectedBoard.items.length > 0 ? (
            <Reorder.Group
              axis="y"
              values={selectedBoard.items}
              onReorder={(newOrder) => {
                const updated = { ...selectedBoard, items: newOrder };
                setSelectedBoard(updated);
              }}
              className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {selectedBoard.items.map((item) => (
                <Reorder.Item
                  key={item.id}
                  value={item}
                  className="group cursor-move"
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative rounded-2xl overflow-hidden aspect-square bg-card border border-border/40 shadow-lg"
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.productName}
                      className="w-full h-full object-cover"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-4 left-4 right-4">
                        <p className="text-white font-semibold text-sm mb-1">{item.productName}</p>
                        <p className="text-white/80 text-xs">{item.price}</p>
                      </div>

                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute top-4 right-4 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={async () => {
                          await inspirationBoard.removeItemFromBoard(selectedBoard.id, item.id);
                          setSelectedBoard({
                            ...selectedBoard,
                            items: selectedBoard.items.filter(i => i.id !== item.id)
                          });
                          haptics.playInteraction('tap');
                        }}
                      >
                        <X size={14} />
                      </Button>
                    </div>
                  </motion.div>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          ) : (
            <div className="text-center py-24 border-2 border-dashed border-border/40 rounded-[3rem]">
              <Heart size={48} className="mx-auto text-muted-foreground/40 mb-4" />
              <p className="text-muted-foreground text-lg">
                This board is empty. Start adding favorites from the shop!
              </p>
            </div>
          )}
        </div>
      )}

      {/* Create Board Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-card rounded-[3rem] p-10 max-w-md w-full border border-border/40 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-serif text-3xl font-bold mb-6">Create New Board</h3>

              <div className="space-y-6">
                <div>
                  <label className="text-sm font-semibold mb-2 block">Board Name</label>
                  <input
                    type="text"
                    value={newBoardName}
                    onChange={(e) => setNewBoardName(e.target.value)}
                    placeholder="e.g., Garden Dreams"
                    className="w-full px-6 py-4 rounded-2xl bg-background border border-border/40 focus:outline-none focus:border-primary transition-colors text-lg"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold mb-2 block">Description (optional)</label>
                  <textarea
                    value={newBoardDesc}
                    onChange={(e) => setNewBoardDesc(e.target.value)}
                    placeholder="What's this board for?"
                    className="w-full px-6 py-4 rounded-2xl bg-background border border-border/40 focus:outline-none focus:border-primary transition-colors text-lg resize-none"
                    rows={3}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1 rounded-full h-12"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 rounded-full h-12 font-bold"
                    onClick={createBoard}
                    disabled={!newBoardName.trim()}
                  >
                    Create Board
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
