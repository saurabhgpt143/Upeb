const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const targetHeaderRow = `<tr>
                            <th className="px-4 py-2">Description</th>
                            <th className="px-4 py-2 w-20 text-center">Unit</th>
                            <th className="px-4 py-2 min-w-[140px] text-right">Quantity</th>
                            <th className="px-4 py-2 min-w-[140px] text-right">Unit Price</th>
                            <th className="px-4 py-2 min-w-[140px] text-right">Total Price</th>
                          </tr>`;

const replHeaderRow = `<tr>
                            <th className="px-4 py-2">
                              <div className="flex items-center gap-1.5">
                                Description
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                              </div>
                            </th>
                            <th className="px-4 py-2 w-20 text-center">Unit</th>
                            <th className="px-4 py-2 min-w-[140px] text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                Quantity
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                              </div>
                            </th>
                            <th className="px-4 py-2 min-w-[140px] text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                Unit Price
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                              </div>
                            </th>
                            <th className="px-4 py-2 min-w-[140px] text-right">Total Price</th>
                          </tr>`;

content = content.replace(targetHeaderRow, replHeaderRow);
fs.writeFileSync('src/App.tsx', content);
console.log('Added pencils');
