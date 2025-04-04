import React from 'react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { Delivery } from '../types';
import { stores, products } from '../data';
import { format, getMonth, getYear, getDate } from 'date-fns';
import { es } from 'date-fns/locale';

interface ExcelExporterProps {
  deliveries: Delivery[];
}

const ExcelExporter: React.FC<ExcelExporterProps> = ({ deliveries }) => {
  const exportToExcel = () => {
    if (deliveries.length === 0) {
      alert('No data to export');
      return;
    }

    // Group deliveries by month
    const deliveriesByMonth = deliveries.reduce<Record<string, Delivery[]>>((acc, delivery) => {
      // Ensure we're parsing the date correctly by using the date string parts
      const [year, month] = delivery.date.split('-').map(Number);
      // Create a consistent key using the original month (1-indexed) and year
      const monthYear = `${month}_${year}`;
      
      if (!acc[monthYear]) {
        acc[monthYear] = [];
      }
      acc[monthYear].push(delivery);
      return acc;
    }, {});

    // Create workbook
    const wb = new ExcelJS.Workbook();

    // Process each month
    Object.entries(deliveriesByMonth).forEach(([monthYearKey, monthDeliveries]) => {
      const [monthNum, yearNum] = monthYearKey.split('_').map(Number);
      // Month in JS is 0-indexed, but our date strings use 1-indexed months
      // So we need to subtract 1 when creating the Date object
      const monthDate = new Date(yearNum, monthNum - 1, 1);
      const monthName = format(monthDate, 'MMMM', { locale: es });
      const monthNameCapitalized = monthName.charAt(0).toUpperCase() + monthName.slice(1);
      const year = yearNum.toString();

      // Create headers for days 1-31
      const headers = ['Tienda', 'Tipo'];
      for (let day = 1; day <= 31; day++) {
        headers.push(day.toString());
      }
      headers.push('Totales', '% de venta');

      // Initialize worksheet data
      const wsData: any[][] = [];
      wsData.push(headers);

      // Group deliveries by day
      const deliveriesByDay: Record<number, Delivery[]> = {};
      monthDeliveries.forEach(delivery => {
        // Ensure we're using the correct day from the date string
        const dateParts = delivery.date.split('-');
        const day = parseInt(dateParts[2], 10);
        if (!deliveriesByDay[day]) {
          deliveriesByDay[day] = [];
        }
        deliveriesByDay[day].push(delivery);
      });

      // Initialize daily totals for chicas and grandes
      const dailyTotalsChica: number[] = Array(31).fill(0);
      const dailyTotalsGrande: number[] = Array(31).fill(0);

      // Process each store
      let grandTotalChicas = 0;
      let grandTotalGrandes = 0;

      stores.forEach(store => {
        // Initialize row data for Chicas
        const chicaRow = [store.name, 'Chica'];
        // Initialize row data for Grandes
        const grandeRow = [store.name, 'Grande'];

        let storeTotalChicas = 0;
        let storeTotalGrandes = 0;

        // Fill in quantities for each day
        for (let day = 1; day <= 31; day++) {
          const dayDeliveries = deliveriesByDay[day] || [];
          const storeDeliveries = dayDeliveries.filter(d => d.storeId === store.id);
          
          let chicaTotal = 0;
          let grandeTotal = 0;
          
          storeDeliveries.forEach(delivery => {
            delivery.products.forEach(product => {
              if (product.productId === '1') { // Chica
                chicaTotal += product.quantity;
              } else if (product.productId === '2') { // Grande
                grandeTotal += product.quantity;
              }
            });
          });
          
          chicaRow.push(chicaTotal ? chicaTotal.toString() : '');
          grandeRow.push(grandeTotal ? grandeTotal.toString() : '');
          
          storeTotalChicas += chicaTotal;
          storeTotalGrandes += grandeTotal;
          
          dailyTotalsChica[day - 1] += chicaTotal;
          dailyTotalsGrande[day - 1] += grandeTotal;
        }

        grandTotalChicas += storeTotalChicas;
        grandTotalGrandes += storeTotalGrandes;

        // Add totals and percentages
        chicaRow.push(storeTotalChicas.toString());
        grandeRow.push(storeTotalGrandes.toString());

        // Add rows to worksheet data if there are deliveries for this store
        if (storeTotalChicas > 0 || storeTotalGrandes > 0) {
          wsData.push(chicaRow);
          wsData.push(grandeRow);
        }
      });

      // Calculate grand total
      const grandTotal = grandTotalChicas + grandTotalGrandes;

      // Add percentage calculations to each row
      for (let i = 2; i < wsData.length; i++) {
        const rowTotal = wsData[i][wsData[i].length - 2];
        if (rowTotal && grandTotal > 0) {
          const percentage = (rowTotal / grandTotal) * 100;
          wsData[i][wsData[i].length - 1] = `${percentage.toFixed(2)}%`;
        } else {
          wsData[i][wsData[i].length - 1] = '0%';
        }
      }

      // Add daily totals row for Chicas
      const totalChicaRow = ['Total Dia', 'Chica'];
      for (let day = 0; day < 31; day++) {
        totalChicaRow.push(dailyTotalsChica[day] ? dailyTotalsChica[day].toString() : '');
      }
      totalChicaRow.push(grandTotalChicas.toString(), '');
      wsData.push(totalChicaRow);

      // Add daily totals row for Grandes
      const totalGrandeRow = ['Total Dia', 'Grande'];
      for (let day = 0; day < 31; day++) {
        totalGrandeRow.push(dailyTotalsGrande[day] ? dailyTotalsGrande[day].toString() : '');
      }
      totalGrandeRow.push(grandTotalGrandes.toString(), '');
      wsData.push(totalGrandeRow);

      // Add empty row
      wsData.push(Array(headers.length).fill(''));

      // Add Resumen section
      wsData.push(['Resumen', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']);
      wsData.push(['Total Chicas', grandTotalChicas, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']);
      wsData.push(['Total Grandes', grandTotalGrandes, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']);
      wsData.push(['Costo Total', (grandTotalChicas * 4) + (grandTotalGrandes * 9), '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']);

      // Create worksheet
      const ws = wb.addWorksheet(`${monthNameCapitalized} ${year}`);
      
      // Add data to worksheet
      ws.addRows(wsData);
      
      // Set column widths
      ws.getColumn(1).width = 15;
      ws.getColumn(2).width = 10;
      for (let i = 3; i <= 33; i++) {
        ws.getColumn(i).width = 5;
      }
      ws.getColumn(34).width = 10;
      ws.getColumn(35).width = 10;
    });

    // Generate filename with month and year of the first month in the data
    // Use the first delivery's date string to ensure correct parsing
    const [yearStr, monthStr] = deliveries[0].date.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10) - 1; // Convert to 0-indexed month for JS Date
    const firstDeliveryDate = new Date(year, month, 1);
    const monthName = format(firstDeliveryDate, 'MMMM', { locale: es });
    const monthNameCapitalized = monthName.charAt(0).toUpperCase() + monthName.slice(1);
    // Use the original year from the date string to ensure consistency
    const fileName = `Entregas_${monthNameCapitalized}_${yearStr}.xlsx`;

    // Write to file and trigger download
    wb.xlsx.writeBuffer().then(buffer => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, fileName);
    });
  };

  return (
    <button
      onClick={exportToExcel}
      className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
    >
      Exportar a Excel
    </button>
  );
};

export default ExcelExporter;