
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, Download, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (products: any[]) => void;
}

const BulkImportModal: React.FC<BulkImportModalProps> = ({
  isOpen,
  onClose,
  onImport
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Mock preview data for demonstration
      setPreviewData([
        { name: 'Sample Product 1', price: 25.99, stock: 100, category: 'Electronics' },
        { name: 'Sample Product 2', price: 15.50, stock: 50, category: 'Clothing' },
      ]);
    }
  };

  const handleImport = async () => {
    if (!file) return;
    
    setImporting(true);
    
    // Simulate import process
    setTimeout(() => {
      const mockProducts = [
        {
          id: Date.now() + 1,
          name: 'Imported Product 1',
          sku: `IMP-${Date.now() + 1}`,
          category: 'Electronics',
          supplier: 'Bulk Import',
          price: 25.99,
          stock: 100,
          status: 'Active',
          image: '/placeholder.svg',
          description: 'Product imported via bulk import'
        },
        {
          id: Date.now() + 2,
          name: 'Imported Product 2',
          sku: `IMP-${Date.now() + 2}`,
          category: 'Clothing',
          supplier: 'Bulk Import',
          price: 15.50,
          stock: 50,
          status: 'Active',
          image: '/placeholder.svg',
          description: 'Product imported via bulk import'
        }
      ];
      
      onImport(mockProducts);
      setImporting(false);
      onClose();
      setFile(null);
      setPreviewData([]);
      
      toast({
        title: "Import Successful",
        description: `${mockProducts.length} products have been imported successfully.`,
      });
    }, 2000);
  };

  const downloadTemplate = () => {
    // Create a sample CSV template
    const csvContent = "name,price,stock,category,supplier,description\nSample Product,25.99,100,Electronics,Sample Supplier,Sample description";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'product_import_template.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Bulk Import Products
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Instructions */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Import Instructions</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Upload a CSV file with your product data. Make sure your file includes columns for name, price, stock, category, supplier, and description.
                </p>
              </div>
            </div>
          </div>

          {/* Template Download */}
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h4 className="font-medium">Download Template</h4>
              <p className="text-sm text-gray-600">Get a sample CSV file to format your data correctly</p>
            </div>
            <Button variant="outline" onClick={downloadTemplate}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>

          {/* File Upload */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Select CSV File</label>
              <Input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
            </div>

            {/* Preview */}
            {previewData.length > 0 && (
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <h4 className="font-medium text-green-900">Preview Data</h4>
                </div>
                <div className="text-sm text-green-700">
                  Found {previewData.length} products ready for import
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={importing}>
              Cancel
            </Button>
            <Button 
              onClick={handleImport} 
              disabled={!file || importing}
              className="min-w-24"
            >
              {importing ? 'Importing...' : 'Import Products'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BulkImportModal;
