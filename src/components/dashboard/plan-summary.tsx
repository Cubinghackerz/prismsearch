
import React from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function PlanSummary() {
  const currentPlan = {
    name: 'Free',
    features: [
      'Basic search functionality',
      'Limited chat capabilities',
      '50 monthly credits',
      '5 saved searches',
      'Standard support'
    ]
  };
  
  const nextPlan = {
    name: 'Starter',
    price: '$9.99',
    features: [
      'Enhanced search capabilities',
      'Full chat functionality',
      '500 monthly credits',
      'Unlimited saved searches',
      'Priority support'
    ]
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Your Plan</h2>
        <Link to="/pricing">
          <Button variant="outline" size="sm">
            Compare All Plans
          </Button>
        </Link>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Current Plan: {currentPlan.name}</CardTitle>
            <CardDescription>Your current active subscription</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {currentPlan.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <Check className="mr-2 h-4 w-4 text-green-500 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle>Recommended: {nextPlan.name}</CardTitle>
            <CardDescription>
              <span className="font-semibold text-lg">{nextPlan.price}</span>
              <span className="text-muted-foreground"> / month</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {nextPlan.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <Check className="mr-2 h-4 w-4 text-green-500 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-prism-violet hover:bg-prism-teal transition-colors">
              Upgrade to {nextPlan.name} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
