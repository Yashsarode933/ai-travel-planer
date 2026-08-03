import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { TripWithDetails } from './types';

export async function exportTripToPDF(trip: TripWithDetails, containerRef: HTMLElement): Promise<void> {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 10;

  let yPosition = margin;
  let page = 1;

  // Add title
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`${trip.destination} Trip`, margin, yPosition);
  yPosition += 15;

  // Add destination details
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Budget Tier: ${trip.budgetTier}`, margin, yPosition);
  pdf.text(`Duration: ${trip.days} days`, margin + 50, yPosition);
  pdf.text(`Currency: ${trip.currency}`, margin + 120, yPosition);
  yPosition += 15;

  // Add total estimated cost
  if (trip.totalEstimatedCost) {
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Total Estimated Cost: ${trip.currency} ${trip.totalEstimatedCost.toLocaleString()}`, margin, yPosition);
    yPosition += 15;
  }

  // Add personal notes if present
  if (trip.notes) {
    yPosition += 5;
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Personal Notes', margin, yPosition);
    yPosition += 8;
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const notesLines = pdf.splitTextToSize(trip.notes, pageWidth - 2 * margin);
    for (const line of notesLines) {
      if (yPosition + 10 > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
        page++;
      }
      pdf.text(line, margin, yPosition);
      yPosition += 5;
    }
    yPosition += 10;
  }

  // Add Places section
  if (trip.places && trip.places.length > 0) {
    // Check if we need a new page
    if (yPosition + 20 > pageHeight - margin) {
      pdf.addPage();
      yPosition = margin;
      page++;
    }
    
    yPosition += 5;
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Places to Visit', margin, yPosition);
    yPosition += 8;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    
    for (const place of trip.places) {
      if (yPosition + 15 > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
        page++;
      }
      
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${place.name}`, margin, yPosition);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`    Category: ${place.category}`, margin + 5, yPosition + 5);
      if (place.description) {
        pdf.text(`    ${place.description}`, margin + 5, yPosition + 10);
      }
      yPosition += place.description ? 20 : 15;
    }
    yPosition += 5;
  }

  // Add Restaurants section
  if (trip.restaurants && trip.restaurants.length > 0) {
    if (yPosition + 20 > pageHeight - margin) {
      pdf.addPage();
      yPosition = margin;
      page++;
    }
    
    yPosition += 5;
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Restaurants to Try', margin, yPosition);
    yPosition += 8;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    
    for (const restaurant of trip.restaurants) {
      if (yPosition + 15 > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
        page++;
      }
      
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${restaurant.name}`, margin, yPosition);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`    Cuisine: ${restaurant.cuisine}`, margin + 5, yPosition + 5);
      if (restaurant.description) {
        pdf.text(`    ${restaurant.description}`, margin + 5, yPosition + 10);
      }
      yPosition += restaurant.description ? 20 : 15;
    }
    yPosition += 5;
  }

  // Add Itinerary section
  if (trip.itinerary && trip.itinerary.length > 0) {
    if (yPosition + 20 > pageHeight - margin) {
      pdf.addPage();
      yPosition = margin;
      page++;
    }
    
    yPosition += 5;
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Day-by-Day Itinerary', margin, yPosition);
    yPosition += 8;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    
    for (const day of trip.itinerary) {
      if (yPosition + 25 > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
        page++;
      }
      
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Day ${day.day}`, margin, yPosition);
      
      const places = trip.places || [];
      const restaurants = trip.restaurants || [];
      
      const getPlaceName = (refId: string) => {
        const place = places.find(p => p.id === refId);
        return place ? place.name : refId;
      };
      
      const getRestaurantName = (refId: string) => {
        const restaurant = restaurants.find(r => r.id === refId);
        return restaurant ? restaurant.name : refId;
      };
      
      const formatItem = (item: { type: string; refId: string; notes?: string }) => {
        let name = '';
        if (item.type === 'place') {
          name = getPlaceName(item.refId);
        } else {
          name = getRestaurantName(item.refId);
        }
        return `${name}${item.notes ? ` (${item.notes})` : ''}`;
      };
      
      pdf.setFont('helvetica', 'normal');
      pdf.text(`  Morning: ${formatItem(day.morning)}`, margin + 5, yPosition + 5);
      pdf.text(`  Afternoon: ${formatItem(day.afternoon)}`, margin + 5, yPosition + 10);
      pdf.text(`  Evening: ${formatItem(day.evening)}`, margin + 5, yPosition + 15);
      
      yPosition += 20;
    }
  }

  // Download the PDF
  const fileName = `${trip.destination.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_trip.pdf`;
  pdf.save(fileName);
}

export function exportTripToPDFFromHTML(trip: TripWithDetails): void {
  // Create a simple text-based PDF without requiring DOM elements
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 15;
  let yPosition = margin;

  // Title
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`Travel Itinerary: ${trip.destination}`, margin, yPosition);
  yPosition += 20;

  // Trip details header
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  const headerInfo = [
    `Budget: ${trip.budgetTier}`,
    `Duration: ${trip.days} days`,
    `Currency: ${trip.currency}`,
    `Total Cost: ${trip.currency} ${trip.totalEstimatedCost?.toLocaleString() || 'N/A'}`
  ];
  
  headerInfo.forEach(info => {
    pdf.text(info, margin, yPosition);
    yPosition += 6;
  });
  yPosition += 10;

  // Personal Notes
  if (trip.notes) {
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Personal Notes', margin, yPosition);
    yPosition += 8;
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const notesLines = pdf.splitTextToSize(trip.notes, pageWidth - 2 * margin);
    notesLines.forEach((line: string) => {
      pdf.text(line, margin, yPosition);
      yPosition += 5;
    });
    yPosition += 10;
  }

  // Places to Visit
  if (trip.places && trip.places.length > 0) {
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Places to Visit', margin, yPosition);
    yPosition += 8;
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    
    trip.places.forEach(place => {
      if (yPosition + 20 > pdf.internal.pageSize.getHeight() - margin) {
        pdf.addPage();
        yPosition = margin;
      }
      
      pdf.setFont('helvetica', 'bold');
      pdf.text(place.name, margin, yPosition);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`  Category: ${place.category}`, margin + 5, yPosition + 5);
      if (place.description) {
        pdf.text(`  ${place.description}`, margin + 5, yPosition + 10);
      }
      if (place.rating && place.rating > 0) {
        pdf.text(`  Rating: ${place.rating} (${place.reviewCount || 0} reviews)`, margin + 5, yPosition + (place.description ? 15 : 10));
      }
      yPosition += place.description ? (place.rating && place.rating > 0 ? 25 : 20) : (place.rating && place.rating > 0 ? 15 : 10);
    });
    yPosition += 10;
  }

  // Restaurants to Try
  if (trip.restaurants && trip.restaurants.length > 0) {
    const priceMap: Record<string, string> = {
      ONE: '$',
      TWO: '$$',
      THREE: '$$$',
      FOUR: '$$$$'
    };
    
    if (yPosition + 20 > pdf.internal.pageSize.getHeight() - margin) {
      pdf.addPage();
      yPosition = margin;
    }
    
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Restaurants to Try', margin, yPosition);
    yPosition += 8;
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    
    trip.restaurants.forEach(restaurant => {
      if (yPosition + 15 > pdf.internal.pageSize.getHeight() - margin) {
        pdf.addPage();
        yPosition = margin;
      }
      
      const priceRange = priceMap[restaurant.priceRange as string] || '$';
      
      pdf.setFont('helvetica', 'bold');
      pdf.text(restaurant.name, margin, yPosition);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`  Cuisine: ${restaurant.cuisine} (${priceRange})`, margin + 5, yPosition + 5);
      if (restaurant.description) {
        pdf.text(`  ${restaurant.description}`, margin + 5, yPosition + 10);
      }
      yPosition += restaurant.description ? 15 : 10;
    });
  }

  // Download
  const fileName = `${trip.destination.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_itinerary.pdf`;
  pdf.save(fileName);
}