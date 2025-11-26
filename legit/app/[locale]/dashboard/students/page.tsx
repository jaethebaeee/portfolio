"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarInitials } from "@/components/ui/avatar";
import {
  Users,
  Search,
  Plus,
  Filter,
  MoreHorizontal,
  Phone,
  Mail,
  Calendar,
  BookOpen,
  TrendingUp,
  UserPlus
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock student data for hagwon
const students = [
  {
    id: "1",
    name: "김민준",
    grade: "고3",
    subjects: ["영어", "수학"],
    phone: "010-1234-5678",
    parentPhone: "010-8765-4321",
    enrollmentDate: "2024-03-01",
    status: "active",
    progress: 85,
    lastAttendance: "2024-11-25"
  },
  {
    id: "2",
    name: "이지현",
    grade: "중2",
    subjects: ["영어", "과학"],
    phone: "010-2345-6789",
    parentPhone: "010-9876-5432",
    enrollmentDate: "2024-02-15",
    status: "active",
    progress: 78,
    lastAttendance: "2024-11-24"
  },
  {
    id: "3",
    name: "박서준",
    grade: "초6",
    subjects: ["수학", "영어"],
    phone: "010-3456-7890",
    parentPhone: "010-8765-4321",
    enrollmentDate: "2024-01-20",
    status: "inactive",
    progress: 92,
    lastAttendance: "2024-11-20"
  }
];

const getGradeColor = (grade: string) => {
  if (grade.includes('초')) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
  if (grade.includes('중')) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
  if (grade.includes('고')) return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
  return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
};

const getStatusColor = (status: string) => {
  return status === 'active'
    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300'
    : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
};

export default function StudentsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.grade.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.subjects.some(subject => subject.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          학생 관리
        </h1>
        <p className="text-muted-foreground text-lg">
          학생 정보 및 학습 진행 상황을 관리하세요
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-all duration-300 hover:border-primary/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">전체 학생</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{students.length}</div>
            <p className="text-xs text-muted-foreground mt-2">
              등록된 학생 수
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:border-primary/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">활성 학생</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <UserPlus className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {students.filter(s => s.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              현재 수강 중
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:border-primary/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">평균 진척도</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {Math.round(students.reduce((acc, s) => acc + s.progress, 0) / students.length)}%
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              전체 학생 평균
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:border-primary/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">오늘 출석</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {students.filter(s => s.lastAttendance === '2024-11-25').length}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              오늘 수업 참석
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="학생 이름, 학년, 과목 검색..."
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
            학생 등록
          </Button>
        </div>
      </div>

      {/* Students List */}
      <Card className="hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            학생 목록
          </CardTitle>
          <CardDescription>
            등록된 모든 학생의 정보를 확인하고 관리하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredStudents.map((student) => (
              <div
                key={student.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>
                      {student.name.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{student.name}</h3>
                      <Badge className={getGradeColor(student.grade)}>
                        {student.grade}
                      </Badge>
                      <Badge className={getStatusColor(student.status)}>
                        {student.status === 'active' ? '수강중' : '중지'}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        {student.subjects.join(', ')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {student.phone}
                      </span>
                      <span>등록일: {student.enrollmentDate}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-sm text-muted-foreground">
                        진척도: {student.progress}%
                      </div>
                      <div className="w-24 bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${student.progress}%` }}
                        />
                      </div>
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
                      <UserPlus className="h-4 w-4 mr-2" />
                      상세 정보
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <BookOpen className="h-4 w-4 mr-2" />
                      진척도 관리
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      학부모 연락
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Calendar className="h-4 w-4 mr-2" />
                      수업 일정
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
