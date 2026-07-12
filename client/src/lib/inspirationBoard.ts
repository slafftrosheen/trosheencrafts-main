/**
 * Inspiration Board Manager
 * Uses IndexedDB for persistent storage of favorite products
 */

interface SavedItem {
  id: string;
  productId: string;
  productName: string;
  imageUrl: string;
  price: string;
  category: string;
  savedAt: Date;
  notes?: string;
  tags?: string[];
}

interface Board {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  items: SavedItem[];
  coverImage?: string;
}

class InspirationBoardManager {
  private dbName = 'TrosheenInspirationBoards';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    if (typeof indexedDB === 'undefined') return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create boards store
        if (!db.objectStoreNames.contains('boards')) {
          const boardStore = db.createObjectStore('boards', { keyPath: 'id' });
          boardStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        // Create items store
        if (!db.objectStoreNames.contains('items')) {
          const itemStore = db.createObjectStore('items', { keyPath: 'id' });
          itemStore.createIndex('boardId', 'boardId', { unique: false });
          itemStore.createIndex('savedAt', 'savedAt', { unique: false });
        }
      };
    });
  }

  async createBoard(name: string, description?: string): Promise<Board> {
    if (!this.db) await this.init();
    if (!this.db) throw new Error('IndexedDB not available');

    const board: Board = {
      id: `board-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      createdAt: new Date(),
      items: [],
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['boards'], 'readwrite');
      const store = transaction.objectStore('boards');
      const request = store.add(board);

      request.onsuccess = () => resolve(board);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllBoards(): Promise<Board[]> {
    if (!this.db) await this.init();
    if (!this.db) return [];

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['boards'], 'readonly');
      const store = transaction.objectStore('boards');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getBoard(boardId: string): Promise<Board | null> {
    if (!this.db) await this.init();
    if (!this.db) return null;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['boards'], 'readonly');
      const store = transaction.objectStore('boards');
      const request = store.get(boardId);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async addItemToBoard(boardId: string, item: Omit<SavedItem, 'id' | 'savedAt'>): Promise<SavedItem> {
    if (!this.db) await this.init();
    if (!this.db) throw new Error('IndexedDB not available');

    const savedItem: SavedItem = {
      ...item,
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      savedAt: new Date(),
    };

    return new Promise(async (resolve, reject) => {
      const board = await this.getBoard(boardId);
      if (!board) {
        reject(new Error('Board not found'));
        return;
      }

      board.items.push(savedItem);
      if (!board.coverImage && savedItem.imageUrl) {
        board.coverImage = savedItem.imageUrl;
      }

      const transaction = this.db!.transaction(['boards'], 'readwrite');
      const store = transaction.objectStore('boards');
      const request = store.put(board);

      request.onsuccess = () => resolve(savedItem);
      request.onerror = () => reject(request.error);
    });
  }

  async removeItemFromBoard(boardId: string, itemId: string): Promise<void> {
    if (!this.db) await this.init();
    if (!this.db) throw new Error('IndexedDB not available');

    return new Promise(async (resolve, reject) => {
      const board = await this.getBoard(boardId);
      if (!board) {
        reject(new Error('Board not found'));
        return;
      }

      board.items = board.items.filter(item => item.id !== itemId);

      const transaction = this.db!.transaction(['boards'], 'readwrite');
      const store = transaction.objectStore('boards');
      const request = store.put(board);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteBoard(boardId: string): Promise<void> {
    if (!this.db) await this.init();
    if (!this.db) throw new Error('IndexedDB not available');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['boards'], 'readwrite');
      const store = transaction.objectStore('boards');
      const request = store.delete(boardId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async isProductSaved(productId: string): Promise<boolean> {
    const boards = await this.getAllBoards();
    return boards.some(board =>
      board.items.some(item => item.productId === productId)
    );
  }

  async exportBoard(boardId: string): Promise<string> {
    const board = await this.getBoard(boardId);
    if (!board) throw new Error('Board not found');

    return JSON.stringify(board, null, 2);
  }

  async importBoard(jsonData: string): Promise<Board> {
    const board: Board = JSON.parse(jsonData);
    board.id = `board-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    board.createdAt = new Date();

    if (!this.db) await this.init();
    if (!this.db) throw new Error('IndexedDB not available');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['boards'], 'readwrite');
      const store = transaction.objectStore('boards');
      const request = store.add(board);

      request.onsuccess = () => resolve(board);
      request.onerror = () => reject(request.error);
    });
  }
}

export const inspirationBoard = new InspirationBoardManager();
