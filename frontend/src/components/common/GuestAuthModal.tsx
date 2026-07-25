import { Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface GuestAuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GuestAuthModal({ open, onOpenChange }: GuestAuthModalProps) {
  const currentPath = typeof window !== "undefined" ? window.location.pathname : "/";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center sm:text-center flex flex-col items-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Lock className="size-6" />
          </div>
          <DialogTitle className="text-center text-lg font-semibold">
            Please sign in to add items to your cart
          </DialogTitle>
          <DialogDescription className="text-center text-sm text-muted-foreground mt-1.5">
            Log in or create an account to start shopping, save items in your bag, and complete your purchase.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-6 flex flex-col gap-2.5 sm:flex-col sm:space-x-0">
          <Button
            asChild
            size="lg"
            className="w-full font-semibold"
            onClick={() => onOpenChange(false)}
          >
            <Link to="/auth/login" search={{ redirect: currentPath }}>
              Sign In
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full font-semibold"
            onClick={() => onOpenChange(false)}
          >
            <Link to="/auth/register">
              Sign Up
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-muted-foreground hover:text-foreground mt-1"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
