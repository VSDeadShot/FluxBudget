import { 
  Coffee, ShoppingCart, Bus, Zap, Film, 
  HelpCircle, Banknote, Shield, Briefcase, 
  Utensils, Plane, Home, HeartPulse, GraduationCap
} from 'lucide-react';

export function getCategoryIcon(name: string) {
  const n = name.toLowerCase();
  if (n.includes('coffee') || n.includes('cafe')) return Coffee;
  if (n.includes('grocer') || n.includes('shop') || n.includes('buy')) return ShoppingCart;
  if (n.includes('transport') || n.includes('bus') || n.includes('train') || n.includes('taxi')) return Bus;
  if (n.includes('utilit') || n.includes('electric') || n.includes('bill')) return Zap;
  if (n.includes('entertain') || n.includes('movie') || n.includes('game') || n.includes('film')) return Film;
  if (n.includes('salary') || n.includes('income') || n.includes('wage')) return Banknote;
  if (n.includes('insur') || n.includes('protect')) return Shield;
  if (n.includes('work') || n.includes('job') || n.includes('business')) return Briefcase;
  if (n.includes('food') || n.includes('dine') || n.includes('restaurant')) return Utensils;
  if (n.includes('travel') || n.includes('flight') || n.includes('vacation')) return Plane;
  if (n.includes('rent') || n.includes('home') || n.includes('house') || n.includes('mortgage')) return Home;
  if (n.includes('health') || n.includes('medic') || n.includes('doctor')) return HeartPulse;
  if (n.includes('educat') || n.includes('school') || n.includes('tuition')) return GraduationCap;
  
  return HelpCircle;
}
