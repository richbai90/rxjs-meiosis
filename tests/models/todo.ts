import { List, Record } from "immutable";
import { ActionsSignature, ModelOf, ServicesSignature } from "../../src/types";
import { timer, Subscription, from, Observable } from "rxjs";
import { takeWhile, finalize } from "rxjs/operators";

export interface TodoServices extends ServicesSignature {
  progress: () => void;
  test: (values: string[]) => Observable<string>;
}

export interface TodoActions extends ActionsSignature {
  addTodo: (title: string, status?: string) => void;
  typeNewTodoTitle: (title: string, status?: string) => void;
}

export interface TodoShape {
  todos: List<Record<{ title: string; status: string }>>;
  todo: Record<{ title: string; status: string }>;
  progress: number;
}
export default {
  initial: {
    todo: Record({
      title: "",
      status: "PENDING"
    })(),
    todos: List([Record({ title: "Learn Meiosis", status: "PENDING" })()]),
    progress: 0
  },
  actions(update) {
    return {
      addTodo: (title, status = "PENDING") => {
        update((state, history) => {
          const todo = Record({ title, status })();
          history(state);
          return state.set("todos", state.get("todos").push(todo));
        });
      },
      typeNewTodoTitle: (title, status = "PENDING") => {
        update(state => {
          return state.set("todo", Record({ title, status })());
        });
      }
    };
  },
  services(actions) {
    return {
      progress: () => {
        let subscription : null | Subscription = null;
        const source = timer(0, 1000).pipe(
          takeWhile(val => val <= 10),
          finalize(() => (subscription = null))
        );
        return () => {
          if (subscription === null) {
            subscription = source.subscribe(v =>
              actions.addTodo("test", "test")
            );
          }
        };
      },
      test: () => (values : string[]) => from(values), 
    };
  }
} as ModelOf<TodoShape, TodoActions, TodoServices>;
