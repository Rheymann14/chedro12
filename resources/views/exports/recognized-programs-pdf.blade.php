<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $title }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            line-height: 1.4;
            margin: 0;
            padding: 20px;
            color: #333; 
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #000000;
            padding-bottom: 20px;
        }
        
        .header h1 {
            color: #000000;
            font-size: 24px;
            margin: 0 0 10px 0;
        }
        
        .header p {
            margin: 5px 0;
            color: #666;
        }
        
        .export-info {
            text-align: right;
            margin-bottom: 20px;
            font-size: 10px;
            color: #666;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
            vertical-align: top;
        }
        
        th {
            background-color: #f8fafc;
            font-weight: bold;
            color: #374151;
            font-size: 11px;
        }
        
        td {
            font-size: 10px;
        }
        
        .institution-name {
            font-weight: bold;
            color: #1f2937;
        }
        
        .institution-code {
            font-family: monospace;
            background-color: #f3f4f6;
            padding: 2px 4px;
            border-radius: 3px;
        }
        
        .contact-info {
            font-size: 9px;
            line-height: 1.3;
        }
        
        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 10px;
            color: #666;
            border-top: 1px solid #e5e7eb;
            padding-top: 15px;
        }
        
        .page-break {
            page-break-before: always;
        }
        
        .no-data {
            text-align: center;
            color: #666;
            font-style: italic;
            padding: 40px;
        }
    </style>
</head>
<body>
    <div class="header">
    
        <h1>Recognized Programs Per Higher Education Institution in Region XII</h1>
        
    </div>
    
    <div class="export-info">
        <p>Generated on: {{ $exportDate }}</p>
        <p>Total Records: {{ count($data) }}</p>
    </div>
    
    @if(count($data) > 0)
        <table>
            <thead>
                <tr>
                    <th style="width: 8%;">Code</th>
                    <th style="width: 25%;">Institution Name</th>
                    <th style="width: 8%;">Region</th>
                    <th style="width: 12%;">Type</th>
                    <th style="width: 15%;">Province</th>
                    <th style="width: 15%;">Municipality</th>
                    
                </tr>
            </thead>
            <tbody>
                @foreach($data as $index => $item)
                    <tr>
                        <td>
                            <span class="institution-code">{{ $item['instCode'] ?? 'N/A' }}</span>
                        </td>
                        <td>
                            <span class="institution-name">{{ $item['instName'] ?? 'N/A' }}</span>
                        </td>
                        <td>{{ $item['region'] ?? 'N/A' }}</td>
                        <td>{{ $item['instType'] ?? 'N/A' }}</td>
                        <td>{{ $item['province'] ?? 'N/A' }}</td>
                        <td>{{ $item['municipality'] ?? 'N/A' }}</td>
                        
                    </tr>
                @endforeach
            </tbody>
        </table>
    @else
        <div class="no-data">
            <p>No data available for export.</p>
        </div>
    @endif
    
    <div class="footer">
        <p>This document was generated automatically by the CHED Region XII System</p>
        <p>For inquiries, please contact the CHED Region XII Office</p>
    </div>
</body>
</html>
