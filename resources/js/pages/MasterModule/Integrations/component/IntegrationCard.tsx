import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Link } from '@inertiajs/react';
import { CircleHelp, LucideIcon } from 'lucide-react';

interface IntegrationCardProps {
    icon: LucideIcon;
    title: string;
    badgeText?: string;
    description: string;
    tooltipText: string;
    buttonText?: string;
    view: string;
    isSetup?: boolean;
    onButtonClick?: () => void;
}

export default function IntegrationCard({
    icon: Icon,
    title,
    badgeText,
    description,
    tooltipText,
    buttonText = 'Configure',
    onButtonClick,
    isSetup = false,
    view
}: IntegrationCardProps) {
    return (
        <Card className="border py-0 border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 bg-white">
            <CardContent className="p-5">
                {/* Header with icon and title */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                        <div className="w-8 h-8 flex items-center justify-center rounded-md bg-gray-100 text-gray-700">
                            <Icon className="w-4 h-4" />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-base font-medium text-gray-900">{title}</h3>
                            {badgeText && (
                                <Badge className="text-xs font-normal text-gray-600 bg-gray-100 border-gray-200 mt-1 py-0 h-5">
                                    {badgeText}
                                </Badge>
                            )}
                        </div>
                    </div>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <CircleHelp className="text-gray-400 hover:text-gray-500 cursor-pointer w-4 h-4" />
                            </TooltipTrigger>
                            <TooltipContent className="text-xs bg-gray-900 text-white">
                                {tooltipText}
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
                
                {/* Description */}
                <div className="mb-5">
                    <p className="text-sm text-gray-500">{description}</p>
                </div>
                
                {/* Action button */}
                <div className="mt-auto">
                    {isSetup ? (
                        <Button 
                            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium text-sm rounded h-8"
                            asChild
                        >
                            <Link href={view}>View</Link>
                        </Button>
                    ) : (
                        <Button 
                            className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium text-sm rounded h-8"
                            onClick={onButtonClick}
                        >
                            {buttonText}
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}