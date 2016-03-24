/*
 * Copyright 2014-2016, Stigmergic-Modeling Project
 * SEIDR, Peking University
 * All rights reserved
 *
 * Stigmergic-Modeling is used for collaborative groups to create a conceptual model.
 * It is based on UML 2.0 class diagram specifications and stigmergy theory.
 */

package net.stigmod.util.generatemodel;

/**
 * @author Kai Fu
 * @version 2016/3/23
 */
import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

import net.stigmod.util.generatemodel.Apriori.ItemSet;

public class FPTree {

    private int minSuport;
    public static BufferedWriter out;
    public static int count;
    public Map<Integer, Set<ItemSet>> rst;
    public int getMinSuport() {
        return minSuport;
    }

    public void setMinSuport(int minSuport) {
        this.minSuport = minSuport;
    }

    // 从若干个文件中读入Transaction Record
    public List<List<String>> readTransRocords(String... filenames) {
        List<List<String>> transaction = null;
        if (filenames.length > 0) {
            transaction = new LinkedList<List<String>>();
            for (String filename : filenames) {
                try {
                    FileReader fr = new FileReader(filename);
                    BufferedReader br = new BufferedReader(fr);
                    try {
                        String line;
                        List<String> record;
                        while ((line = br.readLine()) != null) {
                            if(line.trim().length()>0){
                                String str[] = line.split(",");
                                record = new LinkedList<String>();
                                for (String w : str)
                                    record.add(w);
                                transaction.add(record);
                            }
                        }
                    } finally {
                        br.close();
                    }
                } catch (IOException ex) {
                    System.out.println("Read transaction records failed."
                            + ex.getMessage());
                    System.exit(1);
                }
            }
        }
        return transaction;
    }

    // FP-Growth算法
    public void FPGrowth(List<List<String>> transRecords,
                         List<String> postPattern) throws IOException {
        // 构建项头表，同时也是频繁1项集
        ArrayList<TreeNode> HeaderTable = buildHeaderTable(transRecords);

        if(true) {
            //这个是一定要删除的测试用数据
            for(TreeNode tNode : HeaderTable) {
                System.out.println(tNode.getName()+" ,引用用户数:"+tNode.getCount());
            }
            return;
        }

        // 构建FP-Tree
        TreeNode treeRoot = buildFPTree(transRecords, HeaderTable);
        // 如果FP-Tree为空则返回
        if (treeRoot.getChildren()==null || treeRoot.getChildren().size() == 0)
            return;
        //输出项头表的每一项+postPattern
        if(postPattern!=null){
            for (TreeNode header : HeaderTable) {
//        		String str=header.getName();
        		System.out.println(header.getCount() + "\t" + header.getName());
                List<String> tmplist=new ArrayList<String>();
                tmplist.add(header.getName());
                tmplist.addAll(postPattern);
//    			for (String ele : postPattern) str=str+" "+ele;
                String[] strs=new String[tmplist.size()];
                tmplist.toArray(strs);
                ItemSet iset=new ItemSet(strs);
                iset.frequence=header.getCount();
                if(rst.containsKey(strs.length)) {
                    rst.get(strs.length).add(iset);
                }else {
                    Set<ItemSet> g_set=new HashSet<ItemSet>();
                    g_set.add(iset);
                    rst.put(strs.length, g_set);
                }
//        		System.out.println(strs.length + "\t" + iset); 暂时省略
            }
        }
        else {
            for (TreeNode header : HeaderTable) {
                String[] strs=new String[1];
                strs[0]=header.getName();
                ItemSet iset=new ItemSet(strs);
                if(iset.contains("391")) {
                    System.out.println("1");
                }
                iset.frequence=header.getCount();
                if(rst.containsKey(strs.length)) {
                    rst.get(strs.length).add(iset);
                }else {
                    Set<ItemSet> g_set=new HashSet<ItemSet>();
                    g_set.add(iset);
                    rst.put(strs.length, g_set);
                }
//        		System.out.println(strs.length + "\t" + iset);  暂时省略
            }
        }
        // 找到项头表的每一项的条件模式基，进入递归迭代
        for (TreeNode header : HeaderTable) {
            // 后缀模式增加一项
            List<String> newPostPattern = new LinkedList<String>();
            newPostPattern.add(header.getName());
            if (postPattern != null)
                newPostPattern.addAll(postPattern);
            // 寻找header的条件模式基CPB，放入newTransRecords中
            List<List<String>> newTransRecords = new LinkedList<List<String>>();
            TreeNode backnode = header.getNextHomonym();
            while (backnode != null) {
                int counter = backnode.getCount();
                List<String> prenodes = new ArrayList<String>();
                TreeNode parent = backnode;
                // 遍历backnode的祖先节点，放到prenodes中
                while ((parent = parent.getParent()).getName() != null) {
                    prenodes.add(parent.getName());
                }
                while (counter-- > 0) {
                    newTransRecords.add(prenodes);
                }
                backnode = backnode.getNextHomonym();
            }
            // 递归迭代
            FPGrowth(newTransRecords, newPostPattern);
        }
    }

    // 构建项头表，同时也是频繁1项集
    public ArrayList<TreeNode> buildHeaderTable(List<List<String>> transRecords) {
        ArrayList<TreeNode> F1 = null;
        if (transRecords.size() > 0) {
            F1 = new ArrayList<TreeNode>();
            Map<String, TreeNode> map = new HashMap<String, TreeNode>();
            // 计算事务数据库中各项的支持度
            for (List<String> record : transRecords) {
                for (String item : record) {
                    if (!map.keySet().contains(item)) {
                        TreeNode node = new TreeNode(item);
                        node.setCount(1);
                        map.put(item, node);
                    } else {
                        map.get(item).countIncrement(1);
                    }
                }
            }
            // 把支持度大于（或等于）minSup的项加入到F1中
            Set<String> names = map.keySet();
            for (String name : names) {
                TreeNode tnode = map.get(name);
                if (tnode.getCount() >= minSuport) {
                    F1.add(tnode);
                }
            }
            Collections.sort(F1);
            return F1;
        } else {
            return null;
        }
    }

    // 构建FP-Tree
    public TreeNode buildFPTree(List<List<String>> transRecords,
                                ArrayList<TreeNode> F1) {
        TreeNode root = new TreeNode(); // 创建树的根节点
        for (List<String> transRecord : transRecords) {
            LinkedList<String> record = sortByF1(transRecord, F1);
            TreeNode subTreeRoot = root;
            TreeNode tmpRoot = null;
            if (root.getChildren() != null) {
                while (!record.isEmpty()
                        && (tmpRoot = subTreeRoot.findChild(record.peek())) != null) {
                    tmpRoot.countIncrement(1);
                    subTreeRoot = tmpRoot;
                    record.poll();
                }
            }
            addNodes(subTreeRoot, record, F1);
        }
        return root;
    }

    // 把交易记录按项的频繁程序降序排列
    public LinkedList<String> sortByF1(List<String> transRecord,
                                       ArrayList<TreeNode> F1) {
        Map<String, Integer> map = new HashMap<String, Integer>();
        for (String item : transRecord) {
            // 由于F1已经是按降序排列的，
            for (int i = 0; i < F1.size(); i++) {
                TreeNode tnode = F1.get(i);
                if (tnode.getName().equals(item)) {
                    map.put(item, i);
                }
            }
        }
        ArrayList<Entry<String, Integer>> al = new ArrayList<Entry<String, Integer>>(
                map.entrySet());
        Collections.sort(al, new Comparator<Map.Entry<String, Integer>>() {
            @Override
            public int compare(Entry<String, Integer> arg0,
                               Entry<String, Integer> arg1) {
                // 降序排列
                return arg0.getValue() - arg1.getValue();
            }
        });
        LinkedList<String> rest = new LinkedList<String>();
        for (Entry<String, Integer> entry : al) {
            rest.add(entry.getKey());
        }
        return rest;
    }

    // 把record作为ancestor的后代插入树中
    public void addNodes(TreeNode ancestor, LinkedList<String> record,
                         ArrayList<TreeNode> F1) {
        if (record.size() > 0) {
            while (record.size() > 0) {
                String item = record.poll();
                TreeNode leafnode = new TreeNode(item);
                leafnode.setCount(1);
                leafnode.setParent(ancestor);
                ancestor.addChild(leafnode);

                for (TreeNode f1 : F1) {
                    if (f1.getName().equals(item)) {
                        while (f1.getNextHomonym() != null) {
                            f1 = f1.getNextHomonym();
                        }
                        f1.setNextHomonym(leafnode);
                        break;
                    }
                }

                addNodes(leafnode, record, F1);
            }
        }
    }

    public void ExecuteFP() throws IOException {
//    	File writename = new File("C:\\Users\\victor\\Desktop\\FP-Tree程序结果.txt");
        count=0;
//    	try {
//			writename.createNewFile();
//			out = new BufferedWriter(new FileWriter(writename));
//		} catch (IOException e) {
//			// TODO Auto-generated catch block
//			e.printStackTrace();
//		}
        FPTree fptree = new FPTree();

        fptree.setMinSuport(1);
        List<List<String>> transRecords = fptree
                .readTransRocords("C:\\Users\\victor\\Desktop\\marketdata.txt");
        fptree.FPGrowth(transRecords, null);
//        out.flush(); // 把缓存区内容压入文件
//        out.close(); // 最后记得关闭文件
//        SimpleDateFormat df = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");//设置日期格式
//        System.out.println(df.format(new Date()));// new Date()为获取当前系统时间
//        System.out.println("最后count为："+count);
    }
}