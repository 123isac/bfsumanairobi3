import { useState } from "react";
import { usePermission } from "@/hooks/usePermission";
import { useStaffAuth } from "@/contexts/StaffAuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckSquare, ListTodo, Plus, Clock, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface TaskItem {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  dueDate: string;
  completed: boolean;
}

const TasksPage = () => {
  const canAssign = usePermission("assign_tasks");
  const { workerProfile } = useStaffAuth();

  const [tasks, setTasks] = useState<TaskItem[]>([
    {
      id: "1",
      title: "Daily inventory cycle count (Joint Health Category)",
      description: "Verify physical stock matches the system counts for Glucosamine & Calcium.",
      assignedTo: "Warehouse Department",
      dueDate: "Today",
      completed: false,
    },
    {
      id: "2",
      title: "Prepare CBD dispatch manifests",
      description: "Package and print waybills for orders awaiting courier pickup.",
      assignedTo: "Logistics Department",
      dueDate: "Today",
      completed: false,
    },
  ]);

  const [createOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newDept, setNewDept] = useState("Warehouse");

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextState = !t.completed;
          if (nextState) toast.success("Task marked as completed! 🎉");
          return { ...t, completed: nextState };
        }
        return t;
      })
    );
  };

  const handleCreateTask = () => {
    if (!newTitle.trim()) return;
    const newTask: TaskItem = {
      id: Date.now().toString(),
      title: newTitle,
      description: newDesc,
      assignedTo: newDept,
      dueDate: "Today",
      completed: false,
    };
    setTasks([newTask, ...tasks]);
    toast.success("New operational task assigned!");
    setCreateOpen(false);
    setNewTitle("");
    setNewDesc("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Staff Operations & Tasks</h1>
          <p className="text-muted-foreground mt-1">
            Track daily assignments, warehouse checklists, and fulfillment responsibilities.
          </p>
        </div>
        {canAssign && (
          <Button onClick={() => setCreateOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Assign New Task
          </Button>
        )}
      </div>

      <div className="grid gap-4">
        {tasks.map((task) => (
          <Card
            key={task.id}
            className={`transition-all border-border ${
              task.completed ? "bg-muted/30 opacity-75" : "bg-card shadow-sm"
            }`}
          >
            <CardContent className="p-5 flex items-start gap-4">
              <button
                onClick={() => toggleTask(task.id)}
                className="mt-0.5 rounded-full p-1 text-muted-foreground hover:text-primary transition-colors"
              >
                {task.completed ? (
                  <CheckCircle2 className="h-6 w-6 text-green-600 fill-green-100" />
                ) : (
                  <div className="h-6 w-6 rounded-full border-2 border-muted-foreground/40 hover:border-primary" />
                )}
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3
                    className={`font-semibold text-base ${
                      task.completed ? "line-through text-muted-foreground" : "text-foreground"
                    }`}
                  >
                    {task.title}
                  </h3>
                  <Badge variant="secondary" className="text-xs">
                    {task.assignedTo}
                  </Badge>
                  <Badge variant="outline" className="text-xs gap-1">
                    <Clock className="h-3 w-3" /> {task.dueDate}
                  </Badge>
                </div>
                {task.description && (
                  <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign New Task</DialogTitle>
            <DialogDescription>
              Create an operational task for staff members or departments.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-sm mt-2">
            <div className="space-y-2">
              <Label>Task Title</Label>
              <Input
                placeholder="e.g. Restock display shelves"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Department / Assignee</Label>
              <Input
                placeholder="e.g. Warehouse, Logistics, Teller"
                value={newDept}
                onChange={(e) => setNewDept(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Description / Instructions</Label>
              <Textarea
                placeholder="Details of what needs to be checked or completed..."
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTask} disabled={!newTitle.trim()}>
                Assign Task
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TasksPage;
