"use client";

import React, { useState } from 'react';
import {
  Download,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  GitBranch,
  List,
  Users,
  Building,
  Crown
} from 'lucide-react';
import { Button } from '../../../admincomponents/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../admincomponents/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../admincomponents/ui/tabs';
import { Badge } from '../../../admincomponents/ui/badge';
import { OrgNodeCard } from '../../../admincomponents/org-chart/OrgNodeCard';
import { CreateNodeDialog } from '../../../admincomponents/org-chart/CreateNodeDialog';
import { mockOrgData, type OrgNode } from '../../../admincomponents/org-chart/constants';
import { getNodeStats } from '../../../admincomponents/org-chart/utils';

export default function OrganizationalChart() {
  const [zoomLevel, setZoomLevel] = useState(100);
  const [viewMode, setViewMode] = useState<'tree' | 'list'>('tree');
  const [orgData] = useState<OrgNode>(mockOrgData);

  const stats = getNodeStats(orgData);

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 10, 200));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 10, 50));
  const handleResetZoom = () => setZoomLevel(100);

  const renderOrgNode = (node: OrgNode): React.ReactNode => {
    return (
      <div key={node.id} className="flex flex-col items-center space-y-4">
        <OrgNodeCard
          node={node}
          onEdit={(node) => console.log('Edit', node)}
          onDelete={(node) => console.log('Delete', node)}
          onAddChild={(node) => console.log('Add child', node)}
          onMove={(node) => console.log('Move', node)}
          onViewDetails={(node) => console.log('View details', node)}
        />

        {node.children.length > 0 && (
          <div className="relative">
            <div className="w-px h-8 bg-border mx-auto"></div>

            {node.children.length > 1 && (
              <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-full h-px bg-border"></div>
            )}

            <div className="flex justify-center space-x-8 space-x-reverse">
              {node.children.map((child) => (
                <div key={child.id} className="relative">
                  <div className="w-px h-8 bg-border mx-auto"></div>
                  {renderOrgNode(child)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderListView = (node: OrgNode, level = 0): React.ReactNode[] => {
    const nodes: React.ReactNode[] = [
      <div key={node.id} className={`flex items-center gap-4 p-3 border rounded-lg mb-2 ${level > 0 ? 'mr-8' : ''}`}>
        <div className="flex items-center gap-3 flex-1">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <span className="text-xs text-primary-foreground">{node.name.charAt(0)}</span>
          </div>
          <div>
            <h4 className="font-medium">{node.name}</h4>
            <p className="text-sm text-muted-foreground">{node.position}</p>
          </div>
        </div>
        <Badge variant="outline">{node.department}</Badge>
        {node.employeeCount && (
          <Badge variant="secondary">{node.employeeCount} نفر</Badge>
        )}
      </div>
    ];

    node.children.forEach(child => {
      nodes.push(...renderListView(child, level + 1));
    });

    return nodes;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>چارت سازمانی</h1>
          <p className="text-muted-foreground">
            ساختار سازمانی و سلسله مراتب شرکت
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            دانلود PDF
          </Button>
          <CreateNodeDialog />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">کل کارمندان</p>
                <p className="text-2xl">{stats.totalEmployees}</p>
              </div>
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">تعداد بخش‌ها</p>
                <p className="text-2xl">{stats.departments}</p>
              </div>
              <Building className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">تعداد مدیران</p>
                <p className="text-2xl">{stats.managers}</p>
              </div>
              <Crown className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">سطوح سازمانی</p>
                <p className="text-2xl">{stats.maxLevel + 1}</p>
              </div>
              <GitBranch className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'tree' | 'list')} className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="tree" className="gap-2">
              <GitBranch className="w-4 h-4" />
              نمای درختی
            </TabsTrigger>
            <TabsTrigger value="list" className="gap-2">
              <List className="w-4 h-4" />
              نمای فهرستی
            </TabsTrigger>
          </TabsList>

          {viewMode === 'tree' && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleZoomOut} disabled={zoomLevel <= 50}>
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-sm px-2">{zoomLevel}%</span>
              <Button variant="outline" size="sm" onClick={handleZoomIn} disabled={zoomLevel >= 200}>
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleResetZoom}>
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        <TabsContent value="tree">
          <Card>
            <CardContent className="p-8">
              <div
                className="overflow-auto"
                style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
              >
                {renderOrgNode(orgData)}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>فهرست کارمندان</CardTitle>
              <CardDescription>
                نمای فهرستی تمام اعضای سازمان به ترتیب سلسله مراتب
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {renderListView(orgData)}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
