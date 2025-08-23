import { Crown, Shield, User } from 'lucide-react';
import type { OrgNode } from './constants';

export const getPositionIcon = (position: string) => {
  if (position.includes('مدیر عامل')) return Crown;
  if (position.includes('مدیر')) return Shield;
  return User;
};

export const getPositionIconColor = (position: string) => {
  if (position.includes('مدیر عامل')) return 'text-yellow-600';
  if (position.includes('مدیر')) return 'text-blue-600';
  return 'text-gray-600';
};

export const getNodeColor = (level: number) => {
  switch (level) {
    case 0: return 'border-yellow-300 bg-yellow-50 dark:bg-yellow-950/20';
    case 1: return 'border-blue-300 bg-blue-50 dark:bg-blue-950/20';
    case 2: return 'border-green-300 bg-green-50 dark:bg-green-950/20';
    default: return 'border-gray-300 bg-gray-50 dark:bg-gray-950/20';
  }
};

export const getAllNodes = (node: OrgNode): OrgNode[] => {
  const nodes: OrgNode[] = [node];
  node.children.forEach(child => {
    nodes.push(...getAllNodes(child));
  });
  return nodes;
};

export const findNodeById = (node: OrgNode, id: string): OrgNode | null => {
  if (node.id === id) return node;
  for (const child of node.children) {
    const found = findNodeById(child, id);
    if (found) return found;
  }
  return null;
};

export const getNodeStats = (node: OrgNode) => {
  const allNodes = getAllNodes(node);
  return {
    totalEmployees: allNodes.length,
    departments: [...new Set(allNodes.map(n => n.department))].length,
    managers: allNodes.filter(n => n.position.includes('مدیر')).length,
    maxLevel: Math.max(...allNodes.map(n => n.level))
  };
};