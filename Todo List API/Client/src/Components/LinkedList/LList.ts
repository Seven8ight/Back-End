export type todoItem = {
  id: string;
  userId: string;
  title: string;
  content: string;
  status: "Complete" | "Incomplete";
};

export class Node {
  previous: Node | null = null;
  data: todoItem;
  next: Node | null = null;

  constructor(data: todoItem) {
    this.data = data;
  }
}

export class DLlist {
  head: Node | null = null;

  isEmpty(): boolean {
    return this.head == null;
  }

  insert(data: any): void {
    const newNode = new Node(data);

    if (this.isEmpty()) this.head = newNode;
    else {
      let currentNode = this.head;

      while (currentNode && currentNode.next) {
        currentNode = currentNode.next;
      }

      if (currentNode) {
        currentNode.next = newNode;
        newNode.previous = currentNode;
      }
    }
  }

  removeFirst(): void | any {
    if (this.isEmpty()) return null;

    if (this.head && this.head.next) {
      this.head.next.previous = null;
      this.head = this.head.next;
    }
  }

  removeLast(): void | boolean {
    if (this.isEmpty()) return false;

    let currentNode: Node | null = this.head;

    if (currentNode) {
      while (true) {
        if (currentNode.next) currentNode = currentNode.next;
        else break;
      }

      if (currentNode.previous) currentNode.previous.next = null;
    }
  }

  removeAny(todoId: string): void | boolean | string {
    if (this.isEmpty()) return false;

    let currentNode = this.head;

    if (currentNode) {
      while (true) {
        if (currentNode.data.id == todoId) break;
        else {
          if (currentNode.next) currentNode = currentNode.next;
          else break;
        }
      }

      if (currentNode.data.id != todoId) return "Todo item does not exist";

      if (currentNode.previous && currentNode.next) {
        currentNode.previous.next = currentNode.next;
        currentNode.next.previous = currentNode.previous;
      }
    }
  }

  updateTodo({
    id,
    title,
    content,
    status,
  }: Partial<Omit<todoItem, "userId">>) {
    if (this.isEmpty()) return false;

    let currentNode: Node | null = this.head;

    if (currentNode) {
      while (true) {
        if (currentNode.data.id == id) break;
        else {
          if (currentNode.next) currentNode = currentNode.next;
          else break;
        }
      }

      if (currentNode.data.id != id) return "Todo item does not exist";

      for (let [key, value] of Object.entries({ title, content, status })) {
        if (value && value.length >= 0) {
          if (key == "status" && (value == "Complete" || value == "Incomplete"))
            currentNode.data.status = value;
          else if (key === "title" || key === "description")
            currentNode.data[key as "title" | "content"] = value;
        }
      }
    }
  }

  *getItems(): Generator<todoItem> {
    let current = this.head;
    if (!current) return null;

    while (current) {
      yield current.data;
      if (current.next) current = current.next;
      else break;
    }
  }

  toArray(): todoItem[] {
    let items: todoItem[] = [];

    for (let todo of this.getItems()) {
      items.push(todo);
    }

    return items;
  }
}
