
import { Icon } from "@iconify/react/dist/iconify.js"
import { Badge } from "../ui/badge"
import { Card, CardContent } from "../ui/card"
import { useState } from "react"

interface StoreCardProps {
	store: {
		name: string;
		logo?: string;
		fallbackIcon: string;
		products: number;
		description: string;
		rating?: number;
		deliveryTime?: string;
	};
	index: number;
	handleStoreClick: (storeName: string) => void;
	compact?: boolean;
}

function StoreCard({ store, index, handleStoreClick, compact = false }: StoreCardProps) {
	const [imageError, setImageError] = useState(false);
	const [imageLoaded, setImageLoaded] = useState(false);

	const handleImageError = () => {
		setImageError(true);
	};

	const handleImageLoad = () => {
		setImageLoaded(true);
	};

	// Compact mobile-friendly variant: circular icon/logo with label beneath
	if (compact) {
		return (
			<Card
				key={index}
				className="group cursor-pointer transition-all duration-200 shadow-none p-0 border-none bg-inherit"
				onClick={() => handleStoreClick(store.name)}
			>
				<CardContent className="p-3">
					<div className="flex flex-col items-center text-center">
						<div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gray-50 border overflow-hidden flex items-center justify-center">
							{store.logo && !imageError ? (
								<img
									src={store.logo}
									alt={store.name}
									className="w-full h-full object-cover rounded-full"
									onError={handleImageError}
									onLoad={handleImageLoad}
								/>
							) : (
								<Icon icon={store.fallbackIcon} className="text-primary text-3xl" />
							)}
						</div>
						<div className="mt-2">
							<p className="text-xs sm:text-sm font-medium text-gray-900 line-clamp-1">{store.name}</p>
						</div>
						<Badge variant="secondary" className="mt-1 bg-gray-100 text-gray-700 hover:bg-gray-100 text-[10px] sm:text-xs">
							{store.products}+ Products
						</Badge>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card
			key={index}
			className="group cursor-pointer hover:shadow-lg transition-all duration-300 overflow-hidden"
			onClick={() => handleStoreClick(store.name)}
		>
			<CardContent className="p-0 relative">
				<div className={`relative ${compact ? 'h-32 sm:h-40 md:h-48' : 'h-40 sm:h-48 md:h-52 lg:h-60 xl:h-64'} overflow-hidden`}>
					{/* Background Image */}
					{store.logo && !imageError && (
						<img
							src={store.logo}
							alt={store.name}
							className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
							onError={handleImageError}
							onLoad={handleImageLoad}
						/>
					)}
					
					{/* Fallback Icon - only show if no image or image failed to load */}
					{(!store.logo || imageError || !imageLoaded) && (
						<div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
							<Icon 
								icon={store.fallbackIcon} 
								className={`text-primary group-hover:scale-110 transition-transform duration-300 ${
									compact ? 'text-4xl' : 'text-5xl sm:text-6xl'
								}`}
							/>
						</div>
					)}

					{/* Overlay */}
					<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
					
					{/* Content */}
					<div className="absolute inset-0 flex flex-col justify-end p-4 text-white">
						<h3 className={`font-semibold mb-1 ${compact ? 'text-sm' : 'text-base sm:text-lg'}`}>
							{store.name}
						</h3>
						<p className={`text-white/90 mb-2 line-clamp-1 ${compact ? 'text-xs' : 'text-sm'}`}>
							{store.description}
						</p>
						<Badge 
							variant="secondary" 
							className={`bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm w-fit ${
								compact ? 'text-xs px-2 py-1' : 'text-xs'
							}`}
						>
							{store.products}+ Products
						</Badge>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}

export default StoreCard
