import { fetchFyatGroupDetails } from "@/lib/service";
import SubmitUI from "./SubmitUI";
import { AlertCircle } from "lucide-react";

export const metadata = { title: "Submit FYAT Routine | CRAB University" };

export default async function FyatPublicSubmitPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  let groupName = "";
  try {
    const { group } = await fetchFyatGroupDetails(resolvedParams.id);
    groupName = group.group_name;
  } catch (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-background">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4 opacity-80" />
        <h1 className="text-2xl font-bold text-foreground">Invalid Link</h1>
        <p className="text-muted-foreground mt-2">This FYAT group does not exist or the link is broken.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-lg">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-primary mb-2">CRAB University</h1>
          <p className="text-foreground font-medium">Routine Collection Form</p>
        </div>
        
        {/* Pass the data down to the interactive client component */}
        <SubmitUI groupId={resolvedParams.id} groupName={groupName} />
      </div>
    </div>
  );
}