"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import * as React from "react";
import ar from "@/locales/ar";

export default function CreateProjectPage() {
  const t = ar.create_project;
  const [date, setDate] = React.useState<Date>();

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">{t.title}</CardTitle>
          <CardDescription>
            {t.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">{t.project_title_label}</Label>
            <Input id="title" placeholder={t.project_title_placeholder} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">{t.project_description_label}</Label>
            <Textarea
              id="description"
              placeholder={t.project_description_placeholder}
              className="min-h-[150px]"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="category">{t.category_label}</Label>
              <Select>
                <SelectTrigger id="category">
                  <SelectValue placeholder={t.category_placeholder} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="web-dev">{t.categories.web_dev}</SelectItem>
                  <SelectItem value="mobile-dev">{t.categories.mobile_dev}</SelectItem>
                  <SelectItem value="design">{t.categories.design}</SelectItem>
                  <SelectItem value="writing">{t.categories.writing}</SelectItem>
                  <SelectItem value="devops">{t.categories.devops}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget">{t.budget_label}</Label>
              <Input id="budget" type="number" placeholder={t.budget_placeholder} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="deadline">{t.deadline_label}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>{t.deadline_placeholder}</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags">{t.tags_label}</Label>
            <Input id="tags" placeholder={t.tags_placeholder} />
          </div>
          <Button size="lg" className="w-full">
            {t.submit_button}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
