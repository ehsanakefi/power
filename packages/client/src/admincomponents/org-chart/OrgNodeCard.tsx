import React from 'react';
import { Edit, Trash2, Plus, Settings, Move, Eye, Users } from 'lucide-react';
import { Card, CardContent } from '@/admincomponents/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/admincomponents/ui/avatar';
import { Badge } from '@/admincomponents/ui/badge';
import { Button } from '@/admincomponents/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/admincomponents/ui/dropdown-menu';
import { getPositionIcon, getPositionIconColor, getNodeColor } from './utils';
import type { OrgNode } from './constants';

interface OrgNodeCardProps {
  node: OrgNode;
  onEdit?: (node: OrgNode) => void;
  onDelete?: (node: OrgNode) => void;
  onAddChild?: (node: OrgNode) => void;
  onMove?: (node: OrgNode) => void;
  onViewDetails?: (node: OrgNode) => void;
}

export function OrgNodeCard({
  node,
  onEdit,
  onDelete,
  onAddChild,
  onMove,
  onViewDetails
}: OrgNodeCardProps) {
  const PositionIcon = getPositionIcon(node.position);
  const iconColor = getPositionIconColor(node.position);
  const nodeColor = getNodeColor(node.level);

  return (
    <Card className={`w-64 hover:shadow-lg transition-shadow cursor-pointer ${nodeColor}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <Avatar className="w-12 h-12">
            <AvatarImage src={node.avatar} />
            <AvatarFallback>{node.name.charAt(0)}</AvatarFallback>
          </Avatar>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="w-6 h-6">
                <Settings className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="gap-2"
                onClick={() => onViewDetails?.(node)}
              >
                <Eye className="w-4 h-4" />
                مشاهده جزئیات
              </DropdownMenuItem>
              <DropdownMenuItem
                className="gap-2"
                onClick={() => onEdit?.(node)}
              >
                <Edit className="w-4 h-4" />
                ویرایش
              </DropdownMenuItem>
              <DropdownMenuItem
                className="gap-2"
                onClick={() => onAddChild?.(node)}
              >
                <Plus className="w-4 h-4" />
                افزودن زیرمجموعه
              </DropdownMenuItem>
              <DropdownMenuItem
                className="gap-2"
                onClick={() => onMove?.(node)}
              >
                <Move className="w-4 h-4" />
                جابجایی
              </DropdownMenuItem>
              <DropdownMenuItem
                className="gap-2 text-red-600"
                onClick={() => onDelete?.(node)}
              >
                <Trash2 className="w-4 h-4" />
                حذف
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="text-center space-y-2">
          <h4 className="font-medium text-sm">{node.name}</h4>
          <div className="flex items-center justify-center gap-1">
            <PositionIcon className={`w-4 h-4 ${iconColor}`} />
            <p className="text-xs text-muted-foreground">{node.position}</p>
          </div>
          <Badge variant="outline" className="text-xs">
            {node.department}
          </Badge>

          {node.employeeCount && (
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
              <Users className="w-3 h-3" />
              <span>{node.employeeCount} نفر</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
