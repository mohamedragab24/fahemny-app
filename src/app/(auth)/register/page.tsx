"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function RegisterPage() {
  return (
    <Card>
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-headline">Create an Account</CardTitle>
        <CardDescription>
          Join ConnectNow to find work or hire professionals.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" placeholder="John Doe" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="m@example.com" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" required />
        </div>
        <div className="space-y-2">
          <Label>I am a...</Label>
          <RadioGroup defaultValue="freelancer" className="flex gap-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="freelancer" id="r-freelancer" />
              <Label htmlFor="r-freelancer">Freelancer (looking for work)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="employer" id="r-employer" />
              <Label htmlFor="r-employer">Employer (looking to hire)</Label>
            </div>
          </RadioGroup>
        </div>
        <Button type="submit" className="w-full">
          Create Account
        </Button>
      </CardContent>
      <div className="mt-4 text-center text-sm p-6 pt-0">
        Already have an account?{" "}
        <Link href="/login" className="underline">
          Log in
        </Link>
      </div>
    </Card>
  );
}
