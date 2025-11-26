"use client";

import { WorkflowTemplateMarketplace } from "@/components/workflow-template-marketplace";
import { useRouter } from "next/navigation";

export default function WorkflowTemplatesPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto py-8">
      <WorkflowTemplateMarketplace
        onCreateWorkflow={(template) => {
          // 워크플로우 생성 후 워크플로우 목록으로 이동
          router.push("/dashboard/workflows");
        }}
      />
    </div>
  );
}

