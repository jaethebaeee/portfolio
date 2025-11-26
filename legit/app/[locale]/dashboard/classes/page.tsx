"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Calendar,
  Search,
  Plus,
  Filter,
  Clock,
  Users,
  BookOpen,
  MapPin,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  UserCheck
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock class data for hagwon
const classes = [
  {
    id: "1",
    subject: "영어 회화",
    teacher: "김영희 선생님",
    students: 12,
    maxStudents: 15,
    schedule: "월, 수, 금 17:00-18:30",
    room: "201호",
    status: "active",
    nextSession: "2024-11-27",
    attendance: 10
  },
  {
    id: "2",
    subject: "수학 심화",
    teacher: "박철수 선생님",
    students: 8,
    maxStudents: 10,
    schedule: "화, 목 18:00-19:30",
    room: "301호",
    status: "active",
    nextSession: "2024-11-26",
    attendance: 8
  },
  {
    id: "3",
    subject: "과학 실험",
    teacher: "이민지 선생님",
    students: 6,
    maxStudents: 12,
    schedule: "토 10:00-12:00",
    room: "실험실",
    status: "scheduled",
    nextSession: "2024-11-30",
    attendance: null
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300';
    case 'scheduled':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case 'completed':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'active':
      return '진행중';
    case 'scheduled':
      return '예정됨';
    case 'completed':
      return '종료됨';
    default:
      return status;
  }
};

export default function ClassesPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredClasses = classes.filter(cls =>
    cls.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.teacher.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.room.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          수업 일정 관리
        </h1>
        <p className="text-muted-foreground text-lg">
          수업 스케줄, 출결 현황, 그리고 수업 관리를 한 곳에서
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-all duration-300 hover:border-primary/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">전체 수업</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{classes.length}</div>
            <p className="text-xs text-muted-foreground mt-2">
              개설된 수업 수
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:border-primary/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">진행중 수업</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {classes.filter(c => c.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              현재 진행중
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:border-primary/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">총 학생 수</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {classes.reduce((acc, c) => acc + c.students, 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              등록된 학생 수
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:border-primary/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">오늘 출석률</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <UserCheck className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">85%</div>
            <p className="text-xs text-muted-foreground mt-2">
              평균 출석률
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="수업명, 선생님, 강의실 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            필터
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            수업 등록
          </Button>
        </div>
      </div>

      {/* Classes List */}
      <Card className="hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            수업 목록
          </CardTitle>
          <CardDescription>
            모든 수업의 스케줄과 출결 현황을 확인하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredClasses.map((cls) => (
              <div
                key={cls.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{cls.subject}</h3>
                      <Badge className={getStatusColor(cls.status)}>
                        {getStatusText(cls.status)}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Avatar className="h-5 w-5">
                          <AvatarFallback className="text-xs">
                            {cls.teacher.slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        {cls.teacher}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {cls.schedule}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {cls.room}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        {cls.students}/{cls.maxStudents}명
                      </span>
                      {cls.attendance !== null && (
                        <span className="flex items-center gap-1">
                          <CheckCircle className="h-4 w-4 text-emerald-500" />
                          오늘 출석: {cls.attendance}명
                        </span>
                      )}
                      <span className="text-muted-foreground">
                        다음 수업: {cls.nextSession}
                      </span>
                    </div>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Calendar className="h-4 w-4 mr-2" />
                      일정 관리
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <UserCheck className="h-4 w-4 mr-2" />
                      출결 관리
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Users className="h-4 w-4 mr-2" />
                      학생 목록
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <BookOpen className="h-4 w-4 mr-2" />
                      수업 자료
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
