import { Component, EventEmitter, OnInit, Output, Input, ElementRef, ViewChild } from '@angular/core';
import { Printer } from '../../interfaces/printer.interface';
import { PrintersService } from '../../services/printers.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
export class FilterComponent implements OnInit {
  @Output() filteredPrintersChange = new EventEmitter<Printer[]>(); // Output event
  @Output() filtersApplied = new EventEmitter<void>();
  @Input() selectedCategory?: string;
  @Input() rentable?: boolean;
  // FILTERS
  printers: Printer[] = [];
  filteredPrinters: Printer[] = [];
  selectedPrintSizeFilters: string[] = [];
  printSizesFilter: string[] = ['Carta', 'Doble Carta', 'Tabloide', 'Tabloide +', 'Rollo 4"', 'Rollo 4.25"','Rollo 8"','Rollo 8.34"', 'Rollo 13"'  ];
  selectedColors: string[] = [];
  colorFilter: string[] = ['Color', 'B&N'];
  selectedBrands: string[] = [];
  brands: string[] = ['Konica Minolta', 'Kyocera', 'Epson'];
  selectedRentableOptions: boolean[] = [false, true];
  selectedPrintVelocities: string[] = [];
  printVelocities: string[] = ["24 a 30", "30 a 40", "40 a 50", "50 a 60", "60 a 80", "80 a 100", "100 y más"];
  selectedCategories: string[] = []; 
  categories: string[] = ["Oficina", "Produccion", "Etiquetas", "Plotters", "Inyección de Tinta", "Artes Gráficas"];
  isSectionVisibleProduct: boolean = true;
  isSectionVisibleBrand: boolean = true;
  isSectionVisibleSize: boolean = true;
  isSectionVisibleType: boolean = true;
  isSectionVisibleVelocity: boolean = true;
  isSectionVisibleCategory: boolean = true;
  selectedPrintVelocityStates: { [key: string]: boolean } = {};
  isRentable?: boolean;

  
  filterSectionsState: string = window.innerWidth > 768 ? 'open' : 'closed';
  checked = false;



  constructor(private printerService: PrintersService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.printerService.getPrinters().subscribe((data: any) => {
      this.printers = data;
      this.filteredPrinters = data;

      // this.applyFilters();
      // this.route.queryParams.subscribe(params => {
      //   const categoryQueryParam = params['category'];
      //   const rentableQueryParam = params['rentable'] === 'true';
      //   this.selectedRentableOptions = [rentableQueryParam]
      //   if (categoryQueryParam) {
      //       // Use the category value to set the initial state of your filter buttons
      //       this.toggleCategoryFilter(categoryQueryParam);
      //   }
  
      //   if (rentableQueryParam) {
      //       // Use the rentable value to set the initial state of your filter buttons
      //       this.toggleRentableOptionFilter(rentableQueryParam);
      //   }
      // });
    });
    this.route.queryParams.subscribe(params => {
      this.isRentable = params['rentable'] === 'true';
    });
    
    

    window.addEventListener('resize', this.onResize);
  }
  
  toggleFilterSectionProduct() {
    this.isSectionVisibleProduct = !this.isSectionVisibleProduct;
  }
  toggleFilterSectionBrand() {
    this.isSectionVisibleBrand = !this.isSectionVisibleBrand;
  }
  toggleFilterSectionSize() {
    this.isSectionVisibleSize = !this.isSectionVisibleSize;
  }
  toggleFilterSectionType() {
    this.isSectionVisibleType = !this.isSectionVisibleType;
  }
  toggleFilterSectionVelocity() {
    this.isSectionVisibleVelocity = !this.isSectionVisibleVelocity;
  }
  toggleFilterSectionCategory() {
    this.isSectionVisibleCategory = !this.isSectionVisibleCategory;
  }

  onResize = () => {
    this.filterSectionsState = window.innerWidth > 768 ? 'open' : 'closed';
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.onResize);
  }

  applyFilters(): void {
    if (this.selectedPrintSizeFilters.length > 0) {
      this.filteredPrinters = this.printers.filter((printer) =>
        this.selectedPrintSizeFilters.includes(printer.PrintSize)
      );
    } else {
      this.filteredPrinters = this.printers;
    }

    if (this.selectedColors.length > 0) {
      this.filteredPrinters = this.filteredPrinters.filter((printer) =>
        this.selectedColors.includes(printer.color ? 'Color' : 'B&N')
      );
    }
    
    if (this.selectedBrands.length > 0) {
      this.filteredPrinters = this.filteredPrinters.filter((printer) =>
        this.selectedBrands.includes(printer.brand)
      );
    }

    if (this.selectedRentableOptions.length > 0) {
      this.filteredPrinters = this.filteredPrinters.filter((printer) =>
        this.selectedRentableOptions.includes(printer.rentable)
      );
      console.log('selectedRentableOptions',this.selectedRentableOptions)
      console.log('FIltered Printers:',this.filteredPrinters)
    }

    if (this.selectedPrintVelocities.length > 0) {
      this.filteredPrinters = this.filteredPrinters.filter((printer) =>
        this.selectedPrintVelocities.some((range) => {
          if (range === "100 y más") {
            return parseInt(printer.printVelocity, 10) >= 100;
          }
  
          const [min, max] = range.split(" a ");
          const velocity = parseInt(printer.printVelocity, 10);
          return velocity >= parseInt(min, 10) && velocity <= parseInt(max, 10);
        })
      );
    }

    if (this.selectedCategories.length > 0) {
      this.filteredPrinters = this.filteredPrinters.filter((printer) =>
        this.selectedCategories.includes(printer.category)
      );
    }

    if (this.rentable !== undefined) {
      this.filteredPrinters = this.filteredPrinters.filter((printer) =>
        printer.rentable === this.rentable
      );
    }

    this.filteredPrintersChange.emit(this.filteredPrinters);
    this.filtersApplied.emit();
    this.scrollToTop();
    console.log(this.filteredPrinters)
    
  }

  scrollToTop() {
    window.scrollTo({ top: 480, behavior: 'smooth' });
  }

  togglePrintSizeFilter(printSize: string): void {
    if (this.selectedPrintSizeFilters.includes(printSize)) {
      this.selectedPrintSizeFilters = this.selectedPrintSizeFilters.filter((b) => b !== printSize);
    } else {
      this.selectedPrintSizeFilters.push(printSize);
    }
    this.applyFilters();
  }

  toggleColorFilter(color: string): void {
    // Toggle color filters
    if (this.selectedColors.includes(color)) {
      this.selectedColors = this.selectedColors.filter((c) => c !== color);
    } else {
      this.selectedColors.push(color);
    }
    this.applyFilters(); // Apply filters after toggling
  }

  toggleBrandFilter(brand: string): void {
    if (this.selectedBrands.includes(brand)) {
      this.selectedBrands = this.selectedBrands.filter((b) => b !== brand);
    } else {
      this.selectedBrands.push(brand);
    }
    this.applyFilters();
  }

  toggleRentableOptionFilter(option: boolean): void {
    console.log('toggleRentableOptionFilter', option);
    if (this.selectedRentableOptions.includes(option)) {
      this.selectedRentableOptions = this.selectedRentableOptions.filter((o) => o !== option);
    } else {
      this.selectedRentableOptions.push(option);
    }
    this.applyFilters();
  }

  togglePrintVelocityFilter(range: string): void {
    if (this.selectedPrintVelocities.includes(range)) {
      this.selectedPrintVelocities = this.selectedPrintVelocities.filter((v) => v !== range);
    } else {
      this.selectedPrintVelocities.push(range);
    }
    this.applyFilters();
  }

  toggleCategoryFilter(category: string): void {
    if (this.selectedCategories.includes(category)) {
      this.selectedCategories = this.selectedCategories.filter((c) => c !== category);
    } else {
      this.selectedCategories.push(category);
    }
    this.applyFilters();
  }
  
  resetFilters(): void {
    this.selectedPrintSizeFilters = [];
    this.selectedColors = [];
    this.selectedBrands = [];
    this.selectedRentableOptions = [];
    this.selectedPrintVelocities = [];
    this.selectedCategories = [];
  
    this.applyFilters(); // Apply filters after resetting
  }
  
  toggleCheckbox(data: string, group: string) {
    switch (group) {
      case 'printBrands':
        this.toggleBrandFilter(data);
        break;
      case 'printSizes':
        this.togglePrintSizeFilter(data);
        break;
      case 'printType':
        this.toggleColorFilter(data);
        break;
      case 'printVelocities':
        this.togglePrintVelocityFilter(data);
        break;
    }
  }
  

  
  
  toggleButtons() {
    this.checked = !this.checked;
    console.log('Toggling');
  }

}
