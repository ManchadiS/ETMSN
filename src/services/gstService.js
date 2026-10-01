const {
  listBillings,
  listPurchaseBills,
  listExpenses,
  getRestaurant,
  listRestaurants
} = require('../models/store');

/**
 * Resolves standard date range for GST filing
 * @param {string} month - Format YYYY-MM (e.g. "2026-09")
 * @param {string} fromDate - Format YYYY-MM-DD
 * @param {string} toDate - Format YYYY-MM-DD
 */
function resolveDateRange(month, fromDate, toDate) {
  if (fromDate && toDate) {
    return { startDate: fromDate, endDate: toDate, periodLabel: `${fromDate} to ${toDate}` };
  }

  const now = new Date();
  let targetYear = now.getFullYear();
  let targetMonth = now.getMonth() + 1; // 1-indexed

  if (month && /^\d{4}-\d{2}$/.test(month)) {
    const [y, m] = month.split('-').map(Number);
    targetYear = y;
    targetMonth = m;
  }

  const pad = (n) => n.toString().padStart(2, '0');
  const lastDay = new Date(targetYear, targetMonth, 0).getDate();
  const startDate = `${targetYear}-${pad(targetMonth)}-01`;
  const endDate = `${targetYear}-${pad(targetMonth)}-${pad(lastDay)}`;
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const periodLabel = `${monthNames[targetMonth - 1]} ${targetYear}`;

  // Indian Financial Year: April to March (e.g., Apr 2026 - Mar 2027 is FY 2026-27)
  const fyStart = targetMonth >= 4 ? targetYear : targetYear - 1;
  const financialYear = `${fyStart}-${(fyStart + 1).toString().slice(-2)}`;

  return {
    startDate,
    endDate,
    periodLabel,
    monthStr: `${targetYear}-${pad(targetMonth)}`,
    financialYear
  };
}

/**
 * Computes complete GSTR-3B summary and registers
 */
async function computeGstSummary({ restaurantId, month, fromDate, toDate, scheme }) {
  const { startDate, endDate, periodLabel, monthStr, financialYear } = resolveDateRange(month, fromDate, toDate);

  // 1. Fetch Restaurant Profile
  let restaurant = null;
  if (restaurantId) {
    restaurant = await getRestaurant(restaurantId);
  }
  if (!restaurant) {
    const allRests = await listRestaurants();
    restaurant = allRests[0] || {
      id: 'default',
      name: 'Engineering Tadka',
      address: 'Main Outlet',
      gstin: '27AADCE1234F1Z5',
      legalName: 'Engineering Tadka Foods LLP',
      tradeName: 'Engineering Tadka',
      state: 'Maharashtra',
      stateCode: '27',
      filingFrequency: 'monthly',
      defaultGstScheme: 'restaurant_5_no_itc'
    };
  }

  const selectedScheme = scheme || restaurant.defaultGstScheme || 'restaurant_5_no_itc';

  // 2. Fetch Bills (Outward Supplies)
  const allBills = await listBillings(restaurantId || undefined);
  const periodBills = allBills.filter(b => {
    const d = (b.date || (b.createdAt ? b.createdAt.split('T')[0] : '')).slice(0, 10);
    return d >= startDate && d <= endDate && b.status !== 'cancelled';
  });

  // 3. Fetch Purchase Bills (Inward Supplies)
  const allPurchases = await listPurchaseBills(restaurantId || undefined);
  const periodPurchases = allPurchases.filter(p => {
    const d = (p.date || (p.createdAt ? p.createdAt.split('T')[0] : '')).slice(0, 10);
    return d >= startDate && d <= endDate;
  });

  // 4. Fetch Operational Expenses (Inward Supplies / Services)
  const allExpenses = await listExpenses(restaurantId || undefined);
  const periodExpenses = allExpenses.filter(e => {
    const d = (e.date || (e.createdAt ? e.createdAt.split('T')[0] : '')).slice(0, 10);
    return d >= startDate && d <= endDate;
  });

  // -------------------------------------------------------------
  // CALCULATE OUTWARD SUPPLIES (Sales)
  // -------------------------------------------------------------
  let totalGrossSales = 0;
  let totalDiscount = 0;
  let totalTaxableValue = 0;
  let totalCgst = 0;
  let totalSgst = 0;
  let totalIgst = 0;

  // ECO (Swiggy / Zomato Section 9(5)) vs Direct (Dine-in, Takeaway)
  let directTaxable = 0;
  let directCgst = 0;
  let directSgst = 0;

  let ecoTaxable = 0;
  let ecoCgst = 0;
  let ecoSgst = 0;

  const paymentModesMap = {};
  const orderTypesMap = {};
  const dailyOutwardMap = {};

  const salesRegister = periodBills.map((b, idx) => {
    const taxable = Number(b.amount) || 0;
    // Standard 5% GST for restaurants = 2.5% CGST + 2.5% SGST
    const cgst = Number(b.cgst) != null && Number(b.cgst) > 0 ? Number(b.cgst) : Math.round(taxable * 0.025 * 100) / 100;
    const sgst = Number(b.sgst) != null && Number(b.sgst) > 0 ? Number(b.sgst) : Math.round(taxable * 0.025 * 100) / 100;
    const igst = 0; // Inter-state restaurant supply is rare, defaults to intra-state
    const gross = taxable + cgst + sgst;
    const discount = Number(b.discount) || 0;
    const orderType = (b.orderType || 'dinein').toLowerCase();
    const paymentMode = b.paymentMode || 'Cash';
    const dateStr = (b.date || (b.createdAt ? b.createdAt.split('T')[0] : '')).slice(0, 10);

    totalGrossSales += gross;
    totalDiscount += discount;
    totalTaxableValue += taxable;
    totalCgst += cgst;
    totalSgst += sgst;
    totalIgst += igst;

    // Check if this was routed through an E-Commerce Operator (Swiggy / Zomato)
    const isEco = orderType === 'delivery' || paymentMode.toLowerCase().includes('swiggy') || paymentMode.toLowerCase().includes('zomato');
    if (isEco) {
      ecoTaxable += taxable;
      ecoCgst += cgst;
      ecoSgst += sgst;
    } else {
      directTaxable += taxable;
      directCgst += cgst;
      directSgst += sgst;
    }

    // Accumulators
    paymentModesMap[paymentMode] = (paymentModesMap[paymentMode] || 0) + gross;
    orderTypesMap[orderType] = (orderTypesMap[orderType] || 0) + gross;

    if (!dailyOutwardMap[dateStr]) {
      dailyOutwardMap[dateStr] = { date: dateStr, count: 0, taxable: 0, cgst: 0, sgst: 0, gross: 0 };
    }
    dailyOutwardMap[dateStr].count += 1;
    dailyOutwardMap[dateStr].taxable += taxable;
    dailyOutwardMap[dateStr].cgst += cgst;
    dailyOutwardMap[dateStr].sgst += sgst;
    dailyOutwardMap[dateStr].gross += gross;

    return {
      slNo: idx + 1,
      id: b.id,
      orderNumber: b.orderNumber || idx + 1,
      invoiceNumber: `ET-${dateStr.replace(/-/g, '')}-${b.orderNumber || idx + 1}`,
      date: dateStr,
      customerMobile: b.mobile || 'N/A',
      customerEmail: b.emailId || 'N/A',
      customerGstin: b.customerGstin || 'URP', // Unregistered Person
      supplyType: b.customerGstin ? 'B2B' : 'B2C (Others)',
      orderType: b.orderType || 'dinein',
      isEco,
      paymentMode,
      taxableAmount: Math.round(taxable * 100) / 100,
      gstRate: 5,
      cgstRate: 2.5,
      cgstAmount: Math.round(cgst * 100) / 100,
      sgstRate: 2.5,
      sgstAmount: Math.round(sgst * 100) / 100,
      igstRate: 0,
      igstAmount: 0,
      totalGst: Math.round((cgst + sgst) * 100) / 100,
      grossAmount: Math.round(gross * 100) / 100,
      hsnSacCode: '996331' // Restaurant Service HSN
    };
  });

  // Sort daily breakdown
  const dailyBreakdown = Object.values(dailyOutwardMap).sort((a, b) => a.date.localeCompare(b.date));

  // -------------------------------------------------------------
  // CALCULATE INWARD SUPPLIES (Purchases & Input Tax Credit)
  // -------------------------------------------------------------
  let totalPurchaseGross = 0;
  let totalPurchaseTaxable = 0;
  let totalInwardCgst = 0;
  let totalInwardSgst = 0;
  let totalInwardIgst = 0;
  let totalExemptPurchases = 0;

  const purchaseRegister = periodPurchases.map((p, idx) => {
    const gross = Number(p.totalAmount) || 0;
    const dateStr = (p.date || (p.createdAt ? p.createdAt.split('T')[0] : '')).slice(0, 10);
    
    // Tax components if recorded
    let cgst = Number(p.cgst) || 0;
    let sgst = Number(p.sgst) || 0;
    let igst = Number(p.igst) || 0;
    let taxable = Number(p.taxableAmount) || 0;

    // If explicit tax is 0, check if supplier has GSTIN (standard 5% or 18%)
    if (cgst === 0 && sgst === 0 && igst === 0 && taxable === 0) {
      if (p.supplierGstin && p.supplierGstin.trim().length === 15) {
        // Registered supplier: derive base taxable and 5% GST
        taxable = Math.round((gross / 1.05) * 100) / 100;
        const totalTax = gross - taxable;
        cgst = Math.round((totalTax / 2) * 100) / 100;
        sgst = Math.round((totalTax / 2) * 100) / 100;
      } else {
        // Unregistered / composition / exempt raw items (vegetables, dairy)
        taxable = gross;
        totalExemptPurchases += gross;
      }
    } else if (taxable === 0) {
      taxable = Math.max(0, gross - cgst - sgst - igst);
    }

    totalPurchaseGross += gross;
    totalPurchaseTaxable += taxable;
    totalInwardCgst += cgst;
    totalInwardSgst += sgst;
    totalInwardIgst += igst;

    return {
      slNo: idx + 1,
      id: p.id,
      billNumber: p.billNumber || `PB-${idx + 1}`,
      date: dateStr,
      supplierName: p.supplierName,
      supplierGstin: p.supplierGstin || 'Unregistered',
      itemsCount: (p.items || []).length,
      paymentMode: p.paymentMode || 'Cash',
      taxableAmount: Math.round(taxable * 100) / 100,
      cgst: Math.round(cgst * 100) / 100,
      sgst: Math.round(sgst * 100) / 100,
      igst: Math.round(igst * 100) / 100,
      totalTax: Math.round((cgst + sgst + igst) * 100) / 100,
      totalAmount: Math.round(gross * 100) / 100,
      itcEligibility: selectedScheme === 'standard_18_itc' ? 'Eligible (Table 4A5)' : 'Ineligible u/s 17(5) (Table 4D1)'
    };
  });

  // -------------------------------------------------------------
  // GSTR-3B TABLE 4: INPUT TAX CREDIT (ITC) COMPUTATION
  // -------------------------------------------------------------
  // Standalone restaurants under 5% GST cannot take ITC (Section 17(5) Blocked Credit).
  // Total taxes paid on purchases are reported under 4(D)(1) as Ineligible ITC.
  let eligibleItcCgst = 0;
  let eligibleItcSgst = 0;
  let eligibleItcIgst = 0;

  let ineligibleItcCgst = 0;
  let ineligibleItcSgst = 0;
  let ineligibleItcIgst = 0;

  if (selectedScheme === 'standard_18_itc') {
    // Business claiming ITC
    eligibleItcCgst = totalInwardCgst;
    eligibleItcSgst = totalInwardSgst;
    eligibleItcIgst = totalInwardIgst;
  } else {
    // 5% Restaurant scheme (Default): Blocked under Section 17(5)
    ineligibleItcCgst = totalInwardCgst;
    ineligibleItcSgst = totalInwardSgst;
    ineligibleItcIgst = totalInwardIgst;
  }

  const netItcAvailable = {
    igst: Math.round(eligibleItcIgst * 100) / 100,
    cgst: Math.round(eligibleItcCgst * 100) / 100,
    sgst: Math.round(eligibleItcSgst * 100) / 100,
    cess: 0
  };

  // -------------------------------------------------------------
  // GSTR-3B TABLE 6.1: PAYMENT OF TAX (NET CASH CHALLAN)
  // -------------------------------------------------------------
  // Outward tax liability
  const taxPayable = {
    igst: Math.round(totalIgst * 100) / 100,
    cgst: Math.round(totalCgst * 100) / 100,
    sgst: Math.round(totalSgst * 100) / 100,
    cess: 0
  };

  // Paid through ITC
  const paidThroughItc = {
    igst: Math.min(taxPayable.igst, netItcAvailable.igst),
    cgst: Math.min(taxPayable.cgst, netItcAvailable.cgst),
    sgst: Math.min(taxPayable.sgst, netItcAvailable.sgst),
    cess: 0
  };

  // Balance Tax to be Paid in Cash via Challan PMT-06 (CPIN)
  const netTaxPayableInCash = {
    igst: Math.max(0, Math.round((taxPayable.igst - paidThroughItc.igst) * 100) / 100),
    cgst: Math.max(0, Math.round((taxPayable.cgst - paidThroughItc.cgst) * 100) / 100),
    sgst: Math.max(0, Math.round((taxPayable.sgst - paidThroughItc.sgst) * 100) / 100),
    cess: 0
  };
  const totalCashChallanToPay = Math.round((netTaxPayableInCash.igst + netTaxPayableInCash.cgst + netTaxPayableInCash.sgst) * 100) / 100;

  // -------------------------------------------------------------
  // FORMAT OFFICIAL GSTR-3B FORM OBJECT
  // -------------------------------------------------------------
  const gstr3bForm = {
    gstin: restaurant.gstin || '27AADCE1234F1Z5',
    legalName: restaurant.legalName || 'Engineering Tadka Foods LLP',
    tradeName: restaurant.tradeName || restaurant.name || 'Engineering Tadka',
    year: financialYear,
    period: monthStr,
    periodLabel,
    scheme: selectedScheme,
    filingDueDate: `20th of ${getFollowingMonthName(monthStr)}`,

    // Table 3.1: Details of Outward Supplies and Inward Supplies liable to Reverse Charge
    table3_1: {
      a_outward_taxable_supplies: {
        title: '3.1(a) Outward taxable supplies (other than zero rated, nil rated and exempted)',
        taxableValue: Math.round(directTaxable * 100) / 100,
        integratedTax: 0,
        centralTax: Math.round(directCgst * 100) / 100,
        stateUtTax: Math.round(directSgst * 100) / 100,
        cess: 0
      },
      b_outward_zero_rated: {
        title: '3.1(b) Outward taxable supplies (zero rated / exports)',
        taxableValue: 0,
        integratedTax: 0,
        cess: 0
      },
      c_other_outward_nil_exempt: {
        title: '3.1(c) Other outward supplies (Nil rated, exempted)',
        taxableValue: 0
      },
      d_inward_reverse_charge: {
        title: '3.1(d) Inward supplies liable to reverse charge (RCM)',
        taxableValue: 0,
        integratedTax: 0,
        centralTax: 0,
        stateUtTax: 0,
        cess: 0
      },
      e_non_gst_outward: {
        title: '3.1(e) Non-GST outward supplies (e.g. alcohol for human consumption)',
        taxableValue: 0
      }
    },

    // Table 3.1.1: Supplies notified under section 9(5) of the CGST Act (E-Commerce Operators)
    table3_1_1: {
      i_supplies_where_eco_pays_tax: {
        title: '3.1.1(i) Taxable supplies on which electronic commerce operator pays tax u/s 9(5) (Swiggy / Zomato)',
        taxableValue: Math.round(ecoTaxable * 100) / 100,
        integratedTax: 0,
        centralTax: Math.round(ecoCgst * 100) / 100,
        stateUtTax: Math.round(ecoSgst * 100) / 100,
        cess: 0
      },
      ii_supplies_by_restaurant_through_eco: {
        title: '3.1.1(ii) Taxable supplies made by the registered person through ECO on which ECO is not liable to pay tax',
        taxableValue: 0,
        integratedTax: 0,
        centralTax: 0,
        stateUtTax: 0,
        cess: 0
      }
    },

    // Table 4: Eligible Input Tax Credit (ITC)
    table4_itc: {
      A_itc_available: {
        title: '4(A) ITC Available (whether in full or part)',
        _1_import_of_goods: { igst: 0, cess: 0 },
        _2_import_of_services: { igst: 0, cess: 0 },
        _3_inward_reverse_charge: { igst: 0, cgst: 0, sgst: 0, cess: 0 },
        _4_inward_isd: { igst: 0, cgst: 0, sgst: 0, cess: 0 },
        _5_all_other_itc: {
          title: '4(A)(5) All other ITC (Purchases & Input Services)',
          integratedTax: Math.round(eligibleItcIgst * 100) / 100,
          centralTax: Math.round(eligibleItcCgst * 100) / 100,
          stateUtTax: Math.round(eligibleItcSgst * 100) / 100,
          cess: 0
        }
      },
      B_itc_reversed: {
        title: '4(B) ITC Reversed',
        _1_as_per_rules_42_43: { igst: 0, cgst: 0, sgst: 0, cess: 0 },
        _2_others: { igst: 0, cgst: 0, sgst: 0, cess: 0 }
      },
      C_net_itc_available: {
        title: '4(C) Net ITC Available [4(A) - 4(B)]',
        integratedTax: netItcAvailable.igst,
        centralTax: netItcAvailable.cgst,
        stateUtTax: netItcAvailable.sgst,
        cess: 0
      },
      D_ineligible_itc: {
        title: '4(D) Other Details (Ineligible ITC)',
        _1_as_per_section_17_5: {
          title: '4(D)(1) Ineligible ITC under section 17(5) (Restaurant Blocked Credits)',
          integratedTax: Math.round(ineligibleItcIgst * 100) / 100,
          centralTax: Math.round(ineligibleItcCgst * 100) / 100,
          stateUtTax: Math.round(ineligibleItcSgst * 100) / 100,
          cess: 0
        },
        _2_others: { igst: 0, cgst: 0, sgst: 0, cess: 0 }
      }
    },

    // Table 5: Values of exempt, nil-rated and non-GST inward supplies
    table5_inward_supplies: {
      from_composition_dealers_and_exempt: {
        title: 'From a supplier under composition scheme, Exempt and Nil rated supply',
        interStateSupplies: 0,
        intraStateSupplies: Math.round(totalExemptPurchases * 100) / 100
      },
      non_gst_supply: {
        title: 'Non-GST supply',
        interStateSupplies: 0,
        intraStateSupplies: 0
      }
    },

    // Table 6.1: Payment of Tax
    table6_1_payment: {
      title: '6.1 Payment of tax',
      integratedTax: {
        taxPayable: taxPayable.igst,
        paidThroughItc: paidThroughItc.igst,
        taxPaidInCash: netTaxPayableInCash.igst,
        interest: 0,
        lateFee: 0
      },
      centralTax: {
        taxPayable: taxPayable.cgst,
        paidThroughItc: paidThroughItc.cgst,
        taxPaidInCash: netTaxPayableInCash.cgst,
        interest: 0,
        lateFee: 0
      },
      stateUtTax: {
        taxPayable: taxPayable.sgst,
        paidThroughItc: paidThroughItc.sgst,
        taxPaidInCash: netTaxPayableInCash.sgst,
        interest: 0,
        lateFee: 0
      },
      cess: {
        taxPayable: 0,
        paidThroughItc: 0,
        taxPaidInCash: 0,
        interest: 0,
        lateFee: 0
      },
      totalCashDepositRequired: totalCashChallanToPay
    },

    // HSN Summary (HSN 996331 Restaurant Food & Beverage Service)
    hsnSummary: [
      {
        hsnCode: '996331',
        description: 'Services provided by restaurants, cafes and similar eating facilities',
        uqc: 'NA',
        totalQuantity: periodBills.length,
        totalValue: Math.round(totalGrossSales * 100) / 100,
        taxableValue: Math.round(totalTaxableValue * 100) / 100,
        integratedTax: 0,
        centralTax: Math.round(totalCgst * 100) / 100,
        stateUtTax: Math.round(totalSgst * 100) / 100,
        cess: 0
      }
    ],

    // Executive Metrics
    kpi: {
      totalInvoices: periodBills.length,
      totalGrossSales: Math.round(totalGrossSales * 100) / 100,
      totalDiscounts: Math.round(totalDiscount * 100) / 100,
      totalTaxableValue: Math.round(totalTaxableValue * 100) / 100,
      totalOutputGst: Math.round((totalCgst + totalSgst + totalIgst) * 100) / 100,
      totalPurchaseInvoices: periodPurchases.length,
      totalPurchaseGross: Math.round(totalPurchaseGross * 100) / 100,
      totalInwardGst: Math.round((totalInwardCgst + totalInwardSgst + totalInwardIgst) * 100) / 100,
      netItcClaimed: Math.round((netItcAvailable.cgst + netItcAvailable.sgst + netItcAvailable.igst) * 100) / 100,
      netCashChallanAmount: totalCashChallanToPay
    },

    paymentModes: paymentModesMap,
    orderTypes: orderTypesMap,
    dailyBreakdown,
    salesRegister,
    purchaseRegister
  };

  return gstr3bForm;
}

/**
 * Returns month name for subsequent month
 */
function getFollowingMonthName(monthStr) {
  const [y, m] = monthStr.split('-').map(Number);
  const nextMonth = m === 12 ? 1 : m + 1;
  const nextYear = m === 12 ? y + 1 : y;
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return `${monthNames[nextMonth - 1]} ${nextYear}`;
}

/**
 * Converts summary or registers to CSV format
 */
function generateGstCsv(data, type = 'summary') {
  if (type === 'sales') {
    const headers = [
      'Sl No', 'Invoice No', 'Date', 'Customer Mobile', 'GSTIN', 'Supply Type',
      'Order Type', 'Payment Mode', 'Taxable Amount (INR)', 'CGST Rate %', 'CGST (INR)',
      'SGST Rate %', 'SGST (INR)', 'Total GST (INR)', 'Gross Total (INR)', 'HSN Code'
    ];
    const rows = (data.salesRegister || []).map(r => [
      r.slNo,
      `"${r.invoiceNumber}"`,
      r.date,
      `"${r.customerMobile}"`,
      `"${r.customerGstin}"`,
      `"${r.supplyType}"`,
      `"${r.orderType}"`,
      `"${r.paymentMode}"`,
      r.taxableAmount,
      r.cgstRate,
      r.cgstAmount,
      r.sgstRate,
      r.sgstAmount,
      r.totalGst,
      r.grossAmount,
      r.hsnSacCode
    ]);
    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  }

  if (type === 'purchases') {
    const headers = [
      'Sl No', 'Bill No', 'Date', 'Supplier Name', 'Supplier GSTIN',
      'Taxable Amount (INR)', 'CGST (INR)', 'SGST (INR)', 'IGST (INR)',
      'Total Tax (INR)', 'Total Amount (INR)', 'ITC Eligibility'
    ];
    const rows = (data.purchaseRegister || []).map(r => [
      r.slNo,
      `"${r.billNumber}"`,
      r.date,
      `"${r.supplierName}"`,
      `"${r.supplierGstin}"`,
      r.taxableAmount,
      r.cgst,
      r.sgst,
      r.igst,
      r.totalTax,
      r.totalAmount,
      `"${r.itcEligibility}"`
    ]);
    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  }

  // Summary CSV (Official GSTR-3B structure)
  const lines = [
    `GSTR-3B MONTHLY SUMMARY RETURN`,
    `Trade Name,"${data.tradeName}"`,
    `Legal Name,"${data.legalName}"`,
    `GSTIN,"${data.gstin}"`,
    `Financial Year,"${data.year}"`,
    `Return Period,"${data.periodLabel} (${data.period})"`,
    `Filing Due Date,"${data.filingDueDate}"`,
    `Scheme,"${data.scheme === 'restaurant_5_no_itc' ? '5% Restaurant (No ITC)' : '18% Standard (With ITC)'}"`,
    ``,
    `TABLE 3.1: OUTWARD SUPPLIES AND INWARD SUPPLIES LIABLE TO REVERSE CHARGE`,
    `Nature of Supply,Taxable Value (INR),Integrated Tax (INR),Central Tax (INR),State/UT Tax (INR),Cess (INR)`,
    `"3.1(a) Outward taxable supplies (other than zero rated, nil, exempt)",${data.table3_1.a_outward_taxable_supplies.taxableValue},${data.table3_1.a_outward_taxable_supplies.integratedTax},${data.table3_1.a_outward_taxable_supplies.centralTax},${data.table3_1.a_outward_taxable_supplies.stateUtTax},0`,
    `"3.1(b) Outward taxable supplies (zero rated)",0,0,0,0,0`,
    `"3.1(c) Other outward supplies (Nil rated, exempted)",0,0,0,0,0`,
    `"3.1(d) Inward supplies liable to reverse charge",0,0,0,0,0`,
    `"3.1(e) Non-GST outward supplies",0,0,0,0,0`,
    ``,
    `TABLE 3.1.1: SUPPLIES NOTIFIED U/S 9(5) (SWIGGY / ZOMATO)`,
    `"3.1.1(i) Taxable supplies on which ECO pays tax",${data.table3_1_1.i_supplies_where_eco_pays_tax.taxableValue},0,${data.table3_1_1.i_supplies_where_eco_pays_tax.centralTax},${data.table3_1_1.i_supplies_where_eco_pays_tax.stateUtTax},0`,
    ``,
    `TABLE 4: ELIGIBLE INPUT TAX CREDIT (ITC)`,
    `ITC Type,Integrated Tax (INR),Central Tax (INR),State/UT Tax (INR),Cess (INR)`,
    `"4(A)(5) All other ITC",${data.table4_itc.A_itc_available._5_all_other_itc.integratedTax},${data.table4_itc.A_itc_available._5_all_other_itc.centralTax},${data.table4_itc.A_itc_available._5_all_other_itc.stateUtTax},0`,
    `"4(C) Net ITC Available",${data.table4_itc.C_net_itc_available.integratedTax},${data.table4_itc.C_net_itc_available.centralTax},${data.table4_itc.C_net_itc_available.stateUtTax},0`,
    `"4(D)(1) Ineligible ITC u/s 17(5) (Blocked Credits)",${data.table4_itc.D_ineligible_itc._1_as_per_section_17_5.integratedTax},${data.table4_itc.D_ineligible_itc._1_as_per_section_17_5.centralTax},${data.table4_itc.D_ineligible_itc._1_as_per_section_17_5.stateUtTax},0`,
    ``,
    `TABLE 6.1: PAYMENT OF TAX (NET CASH CHALLAN REQUIRED)`,
    `Description,Integrated Tax (INR),Central Tax (INR),State/UT Tax (INR),Cess (INR),Total Cash (INR)`,
    `"Tax Payable",${data.table6_1_payment.integratedTax.taxPayable},${data.table6_1_payment.centralTax.taxPayable},${data.table6_1_payment.stateUtTax.taxPayable},0,${data.kpi.totalOutputGst}`,
    `"Paid through ITC",${data.table6_1_payment.integratedTax.paidThroughItc},${data.table6_1_payment.centralTax.paidThroughItc},${data.table6_1_payment.stateUtTax.paidThroughItc},0,${data.kpi.netItcClaimed}`,
    `"Tax Paid in Cash (PMT-06 Challan)",${data.table6_1_payment.integratedTax.taxPaidInCash},${data.table6_1_payment.centralTax.taxPaidInCash},${data.table6_1_payment.stateUtTax.taxPaidInCash},0,${data.table6_1_payment.totalCashDepositRequired}`
  ];

  return lines.join('\n');
}

module.exports = {
  computeGstSummary,
  generateGstCsv,
  resolveDateRange
};
