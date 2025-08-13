
import React, { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { logger } from "@/lib/logger";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Calendar, Save, FileText, Eye, CalendarDays } from "lucide-react";
import { mealScheduleAPI, MealScheduleEntry } from "@/lib/api/apiService";

interface UploadedMealData {
  date: string;
  veg_salad: string;
  non_veg_salad: string;
  veg_meal: string;
  non_veg_meal_1: string;
  non_veg_meal_2: string;
}

const MealPlanning = () => {
  // Schedule Meals Tab State
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [mealSchedule, setMealSchedule] = useState<MealScheduleEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // View Scheduled Meals Tab State
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState<string>((new Date().getMonth() + 1).toString().padStart(2, '0'));
  const [scheduledMeals, setScheduledMeals] = useState<MealScheduleEntry[]>([]);
  const [isLoadingScheduled, setIsLoadingScheduled] = useState(false);
  const [activeTab, setActiveTab] = useState("schedule");

  // Transform uploaded JSON data to our required format
  const transformMealData = (uploadedData: UploadedMealData[]): MealScheduleEntry[] => {
    return uploadedData.map(item => {
      // Keep the original date string as-is (it's already in YYYY-MM-DD format)
      
      return {
        date: item.date, // Don't modify the date string
        meal_1: item.veg_salad?.trim() || "",
        meal_2: item.non_veg_salad?.trim() || "",
        meal_3: item.veg_meal?.trim() || "",
        meal_4: item.non_veg_meal_1?.trim() || "",
        meal_5: item.non_veg_meal_2?.trim() || "",
      };
    });
  };

  // Handle file upload and JSON parsing
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/json") {
      toast.error("Please upload a valid JSON file");
      return;
    }

    setUploadedFile(file);
    setIsLoading(true);

    try {
      const fileContent = await file.text();
      const jsonData = JSON.parse(fileContent) as UploadedMealData[];
      
      if (!Array.isArray(jsonData)) {
        throw new Error("JSON file must contain an array of meal schedules");
      }

      // Validate JSON structure
      const requiredFields = ['date', 'veg_salad', 'non_veg_salad', 'veg_meal', 'non_veg_meal_1', 'non_veg_meal_2'];
      const isValid = jsonData.every(item => 
        requiredFields.every(field => field in item)
      );

      if (!isValid) {
        throw new Error("Invalid JSON structure. Required fields: date, veg_salad, non_veg_salad, veg_meal, non_veg_meal_1, non_veg_meal_2");
      }

      const transformedData = transformMealData(jsonData);
      setMealSchedule(transformedData);
      toast.success(`Successfully loaded ${transformedData.length} meal schedules`);
    } catch (error) {
      logger.error("Error parsing JSON:", error);
      toast.error(`Error parsing JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setUploadedFile(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle individual meal editing
  const handleMealEdit = (index: number, field: keyof Omit<MealScheduleEntry, 'date'>, value: string) => {
    const updatedSchedule = [...mealSchedule];
    updatedSchedule[index] = {
      ...updatedSchedule[index],
      [field]: value
    };
    setMealSchedule(updatedSchedule);
  };

  // Submit meal schedule to backend
  const handleSubmitSchedule = async () => {
    if (mealSchedule.length === 0) {
      toast.error("No meal schedule to submit");
      return;
    }

    

    setIsSubmitting(true);
    try {
      const response = await mealScheduleAPI.scheduleMultipleMeals(mealSchedule);
      
      if (response.success && response.data) {
        toast.success(`Successfully scheduled ${response.data.scheduled_count} meals`);
        
        // Optionally clear the data after successful submission
        setMealSchedule([]);
        setUploadedFile(null);
      } else {
        throw new Error(response.error || "Failed to schedule meals");
      }
    } catch (error) {
      logger.error("Error submitting meal schedule:", error);
      toast.error(`Failed to submit meal schedule: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format date for display (ensuring local interpretation)
  const formatDisplayDate = (dateString: string) => {
    // Parse as local date to avoid timezone shifts
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get compact date display for table cells
  const getCompactDateDisplay = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    
    const result = {
      monthDay: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      weekday: date.toLocaleDateString('en-US', { weekday: 'short' })
    };
    return result;
  };

  // Generate year options (current year ± 2 years)
  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 2; i <= currentYear + 2; i++) {
      years.push(i.toString());
    }
    return years;
  };

  // Generate month options
  const getMonthOptions = () => {
    return [
      { value: "01", label: "January" },
      { value: "02", label: "February" },
      { value: "03", label: "March" },
      { value: "04", label: "April" },
      { value: "05", label: "May" },
      { value: "06", label: "June" },
      { value: "07", label: "July" },
      { value: "08", label: "August" },
      { value: "09", label: "September" },
      { value: "10", label: "October" },
      { value: "11", label: "November" },
      { value: "12", label: "December" },
    ];
  };

  // Load scheduled meals for selected month
  const loadScheduledMeals = async () => {
    setIsLoadingScheduled(true);
    try {
      // Calculate start and end dates for the selected month
      const startDate = `${selectedYear}-${selectedMonth}-01`;
      const lastDay = new Date(parseInt(selectedYear), parseInt(selectedMonth), 0).getDate();
      const endDate = `${selectedYear}-${selectedMonth}-${lastDay.toString().padStart(2, '0')}`;

      
      const response = await mealScheduleAPI.getMealSchedule(startDate, endDate);
      
      if (response.success && response.data) {
        setScheduledMeals(response.data);
        toast.success(`Loaded ${response.data.length} scheduled meals for ${getMonthOptions().find(m => m.value === selectedMonth)?.label} ${selectedYear}`);
      } else {
        throw new Error(response.error || "Failed to load scheduled meals");
      }
    } catch (error) {
      logger.error("Error loading scheduled meals:", error);
      toast.error(`Failed to load scheduled meals: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setScheduledMeals([]);
    } finally {
      setIsLoadingScheduled(false);
    }
  };

  // Handle month/year change and auto-load data
  const handleMonthYearChange = (type: 'month' | 'year', value: string) => {
    if (type === 'month') {
      setSelectedMonth(value);
    } else {
      setSelectedYear(value);
    }
    
    // Auto-load data when both month and year are selected
    // We'll trigger the load in useEffect or manually
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meal Planning</h1>
          <p className="text-muted-foreground">Upload and manage meal schedules</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="schedule" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Schedule Meals
          </TabsTrigger>
          <TabsTrigger value="view" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            View Scheduled Meals
          </TabsTrigger>
        </TabsList>

        {/* Schedule Meals Tab */}
        <TabsContent value="schedule" className="space-y-6">
          {/* File Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Meal Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="meal-schedule-file">JSON File</Label>
                  <Input
                    id="meal-schedule-file"
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    disabled={isLoading}
                  />
                </div>
                
                {uploadedFile && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>{uploadedFile.name}</span>
                    <span className="text-green-600">✓ Loaded</span>
                  </div>
                )}

                <div className="text-sm text-muted-foreground">
                  <p><strong>Expected JSON format:</strong></p>
                  <code className="block mt-1 p-2 bg-muted rounded text-xs">
                    {`[{"date": "2025-08-01", "veg_salad": "Salad Name", "non_veg_salad": "Salad Name", "veg_meal": "Meal Name", "non_veg_meal_1": "Meal Name", "non_veg_meal_2": "Meal Name"}]`}
                  </code>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Meal Schedule Table */}
          {mealSchedule.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Calendar className="h-4 w-4" />
                    Meal Schedule ({mealSchedule.length} days)
                  </CardTitle>
                  <Button 
                    onClick={handleSubmitSchedule}
                    disabled={isSubmitting}
                    size="sm"
                    className="ml-auto"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isSubmitting ? "Submitting..." : "Submit Schedule"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-3">
                <div className="overflow-x-auto border rounded-md">
                  <Table className="text-sm">
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead className="w-[120px] h-8 px-2 text-xs font-semibold">Date</TableHead>
                        <TableHead className="h-8 px-2 text-xs font-semibold">Meal 1<br/><span className="text-muted-foreground font-normal">(Veg Salad)</span></TableHead>
                        <TableHead className="h-8 px-2 text-xs font-semibold">Meal 2<br/><span className="text-muted-foreground font-normal">(Non-Veg Salad)</span></TableHead>
                        <TableHead className="h-8 px-2 text-xs font-semibold">Meal 3<br/><span className="text-muted-foreground font-normal">(Veg Meal)</span></TableHead>
                        <TableHead className="h-8 px-2 text-xs font-semibold">Meal 4<br/><span className="text-muted-foreground font-normal">(Non-Veg Meal 1)</span></TableHead>
                        <TableHead className="h-8 px-2 text-xs font-semibold">Meal 5<br/><span className="text-muted-foreground font-normal">(Non-Veg Meal 2)</span></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mealSchedule.map((schedule, index) => (
                        <TableRow key={schedule.date} className="h-12">
                          <TableCell className="font-medium px-2 py-1 text-xs w-[120px]">
                            <div className="text-center">
                              <div className="font-semibold">{getCompactDateDisplay(schedule.date).monthDay}</div>
                              <div className="text-muted-foreground">{getCompactDateDisplay(schedule.date).weekday}</div>
                            </div>
                          </TableCell>
                          <TableCell className="px-2 py-1">
                            <Input
                              value={schedule.meal_1}
                              onChange={(e) => handleMealEdit(index, 'meal_1', e.target.value)}
                              className="h-8 text-xs border-muted w-full min-w-[160px]"
                              placeholder="Enter meal name"
                            />
                          </TableCell>
                          <TableCell className="px-2 py-1">
                            <Input
                              value={schedule.meal_2}
                              onChange={(e) => handleMealEdit(index, 'meal_2', e.target.value)}
                              className="h-8 text-xs border-muted w-full min-w-[160px]"
                              placeholder="Enter meal name"
                            />
                          </TableCell>
                          <TableCell className="px-2 py-1">
                            <Input
                              value={schedule.meal_3}
                              onChange={(e) => handleMealEdit(index, 'meal_3', e.target.value)}
                              className="h-8 text-xs border-muted w-full min-w-[160px]"
                              placeholder="Enter meal name"
                            />
                          </TableCell>
                          <TableCell className="px-2 py-1">
                            <Input
                              value={schedule.meal_4}
                              onChange={(e) => handleMealEdit(index, 'meal_4', e.target.value)}
                              className="h-8 text-xs border-muted w-full min-w-[160px]"
                              placeholder="Enter meal name"
                            />
                          </TableCell>
                          <TableCell className="px-2 py-1">
                            <Input
                              value={schedule.meal_5}
                              onChange={(e) => handleMealEdit(index, 'meal_5', e.target.value)}
                              className="h-8 text-xs border-muted w-full min-w-[160px]"
                              placeholder="Enter meal name"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                {/* Summary */}
                <div className="mt-3 text-xs text-muted-foreground flex items-center justify-between">
                  <span>Total meals: {mealSchedule.length * 5}</span>
                  <span>Date range: {mealSchedule[0]?.date} to {mealSchedule[mealSchedule.length - 1]?.date}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {mealSchedule.length === 0 && !isLoading && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Meal Schedule Loaded</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  Upload a JSON file with your meal schedule to get started. You can then edit the meals and submit them to the database.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* View Scheduled Meals Tab */}
        <TabsContent value="view" className="space-y-6">
          {/* Month/Year Selector */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                Select Month to View
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="space-y-2">
                  <Label htmlFor="year-select">Year</Label>
                  <Select value={selectedYear} onValueChange={(value) => handleMonthYearChange('year', value)}>
                    <SelectTrigger className="w-[100px]">
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {getYearOptions().map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="month-select">Month</Label>
                  <Select value={selectedMonth} onValueChange={(value) => handleMonthYearChange('month', value)}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Month" />
                    </SelectTrigger>
                    <SelectContent>
                      {getMonthOptions().map((month) => (
                        <SelectItem key={month.value} value={month.value}>
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="pt-8">
                  <Button 
                    onClick={loadScheduledMeals}
                    disabled={isLoadingScheduled}
                    size="sm"
                  >
                    {isLoadingScheduled ? "Loading..." : "Load Meals"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Scheduled Meals Display */}
          {scheduledMeals.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="h-4 w-4" />
                  Scheduled Meals for {getMonthOptions().find(m => m.value === selectedMonth)?.label} {selectedYear} ({scheduledMeals.length} days)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <div className="overflow-x-auto border rounded-md">
                  <Table className="text-sm">
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead className="w-[120px] h-8 px-2 text-xs font-semibold">Date</TableHead>
                        <TableHead className="h-8 px-2 text-xs font-semibold">Meal 1<br/><span className="text-muted-foreground font-normal">(Veg Salad)</span></TableHead>
                        <TableHead className="h-8 px-2 text-xs font-semibold">Meal 2<br/><span className="text-muted-foreground font-normal">(Non-Veg Salad)</span></TableHead>
                        <TableHead className="h-8 px-2 text-xs font-semibold">Meal 3<br/><span className="text-muted-foreground font-normal">(Veg Meal)</span></TableHead>
                        <TableHead className="h-8 px-2 text-xs font-semibold">Meal 4<br/><span className="text-muted-foreground font-normal">(Non-Veg Meal 1)</span></TableHead>
                        <TableHead className="h-8 px-2 text-xs font-semibold">Meal 5<br/><span className="text-muted-foreground font-normal">(Non-Veg Meal 2)</span></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                                             {scheduledMeals.map((schedule) => (
                         <TableRow key={schedule.date} className="h-12">
                           <TableCell className="font-medium px-2 py-1 text-xs w-[120px]">
                             <div className="text-center">
                               <div className="font-semibold">{getCompactDateDisplay(schedule.date).monthDay}</div>
                               <div className="text-muted-foreground">{getCompactDateDisplay(schedule.date).weekday}</div>
                             </div>
                           </TableCell>
                          <TableCell className="px-2 py-1 text-xs">{schedule.meal_1}</TableCell>
                          <TableCell className="px-2 py-1 text-xs">{schedule.meal_2}</TableCell>
                          <TableCell className="px-2 py-1 text-xs">{schedule.meal_3}</TableCell>
                          <TableCell className="px-2 py-1 text-xs">{schedule.meal_4}</TableCell>
                          <TableCell className="px-2 py-1 text-xs">{schedule.meal_5}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                {/* Summary */}
                <div className="mt-3 text-xs text-muted-foreground flex items-center justify-between">
                  <span>Total meals: {scheduledMeals.length * 5}</span>
                  <span>Date range: {scheduledMeals[0]?.date} to {scheduledMeals[scheduledMeals.length - 1]?.date}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Empty State for View Tab */}
          {scheduledMeals.length === 0 && !isLoadingScheduled && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CalendarDays className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Scheduled Meals Found</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  Select a month and year above, then click "Load Meals" to view scheduled meals for that period.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MealPlanning;
