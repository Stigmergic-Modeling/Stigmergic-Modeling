
package net.stigmod.service.migrateService;

import net.stigmod.domain.conceptualmodel.ClassNode;
import net.stigmod.domain.system.CollectiveConceptualModel;
import net.stigmod.domain.conceptualmodel.RelationNode;
import net.stigmod.domain.conceptualmodel.ValueNode;
import net.stigmod.domain.conceptualmodel.ClassToValueEdge;
import net.stigmod.domain.conceptualmodel.RelationToClassEdge;
import net.stigmod.domain.conceptualmodel.RelationToValueEdge;
import net.stigmod.repository.node.ClassNodeRepository;
import net.stigmod.repository.node.CollectiveConceptualModelRepository;
import net.stigmod.repository.node.RelationNodeRepository;
import net.stigmod.repository.node.ValueNodeRepository;
import net.stigmod.repository.relationship.ClassToVEdgeRepository;
import net.stigmod.repository.relationship.RelationToCEdgeRepository;
import net.stigmod.repository.relationship.RelationToVEdgeRepository;
import org.springframework.beans.factory.annotation.Autowired;

import java.text.SimpleDateFormat;
import java.util.*;

/**
 *
 *
 * @version     2015/11/12
 * @author 	    Kai Fu
 */
public class MigrateHandlerImpl implements MigrateHandler {

    @Autowired
    private CollectiveConceptualModelRepository collectiveConceptualModelRepository;

    @Autowired
    private ClassNodeRepository classNodeRepository;

    @Autowired
    private RelationNodeRepository relationNodeRepository;

    @Autowired
    private ValueNodeRepository valueNodeRepository;

    @Autowired
    private ClassToVEdgeRepository classToVEdgeRepository;

    @Autowired
    private RelationToCEdgeRepository relationToCEdgeRepository;

    @Autowired
    private RelationToVEdgeRepository relationToVEdgeRepository;

//    @Autowired
//    private MigrateUtil migrateUtil;

//    @Autowired
//    private EntropyHandler entropyHandler;

    private MigrateUtil migrateUtil=new MigrateUtil();

    private EntropyHandler entropyHandler=new EntropyHandlerImpl();

    private List<ClassNode> classNodeList;

    private List<RelationNode> relationNodeList;

    private List<ValueNode> valueNodeList;

    private int nodeSum;

    private boolean isStable=false;

    private Long modelId;

    private long curIdLoc ;

    private double systemEntropy;

    /**
     * 初始化
     * @param id (the id is ccm id)
     * 每次执行migrateHandler进行融合操作之前,都需要执行一次migrateInit方法(当然该方法自动在migrateHandler中被调用)
     */
    private void migrateInit(Long id) {
        //获取ccm对象
        CollectiveConceptualModel ccm=collectiveConceptualModelRepository.findOne(id);

        //获取ccm中各种node的数据
        this.classNodeList=convertClassIdToObj(ccm.getClassNodesId());
        this.relationNodeList=convertRelationIdToObj(ccm.getRelationNodesId());
        this.valueNodeList=convertValueIdToObj(ccm.getValueNodesId());

        this.nodeSum=(classNodeList.size()+relationNodeList.size()+valueNodeList.size());

        modelId=ccm.getId();

        curIdLoc=((long)(classNodeList.size()+relationNodeList.size()+valueNodeList.size())*1000);//这个到时候肯定要删除

        //获取ccm种各种edge的数据
//        this.ctvEdgeList=classToVEdgeRepository.findByModelId(modelId);
//        this.rtcEdgeList=relationToCEdgeRepository.findByModelId(modelId);
//        this.rtvEdgeList=relationToVEdgeRepository.findByModelId(modelId);//之所以预先全部获取的原因在于不想在融合的过程中发生数据库存取操作

        //初始化isStable函数
        this.isStable=false;

        this.systemEntropy = 0.0;

        setLocForList();
    }

    public void migrateInitForTest(List<ClassNode> classNodeList , List<RelationNode> relationNodeList ,
                                   List<ValueNode> valueNodeList,long curIdLoc) {
        modelId=0l;
        this.classNodeList = classNodeList;
        this.relationNodeList = relationNodeList;
        this.valueNodeList = valueNodeList;
        this.isStable=false;
        this.nodeSum=(classNodeList.size()+relationNodeList.size()+valueNodeList.size());
        this.systemEntropy = 0.0;
        this.curIdLoc=(curIdLoc+1);

        setLocForList();
    }

    @Override
    public void migrateHandler(Long id) {//初始化各变量
//        migrateInit(id);
//        int rNum=relationNodeList.size();
        int cNum=classNodeList.size();
        int curIterNum=0;
        int iterNum = 0;

        SimpleDateFormat df = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        System.out.println("算法运行启动时间为: " + df.format(new Date()));

        systemEntropy = entropyHandler.initNodeListEntropy(classNodeList,relationNodeList,valueNodeList,nodeSum);
        System.out.println("系统初始熵值为: "+systemEntropy);

        while(true) {//此代码中采用的融合算法规则为随机选择节点进行融合迁移判断
            iterNum++;
            System.out.println("融合算法迭代轮数: "+iterNum);
            isStable=true;//在migrateClassNode和migrateRelationNode中若发生迁移则会由isStable转为false;
            int[] randomList=randomValue();
//            int[] randomList={0,41};
//            int[] randomList = {0,57,86,177,158,151,8,248,204,146,250,237,233,126,211,20,201,150,159,48,267,194,253,139,168,143,61,256,40,43,23,271,157,251,136,93,144,63,98,125,183,274,119,28,246,84,196,182,234,83,56,208,118,231,192,243,38,95,117,175,25,172,13,188,49,76,213,222,224,252,142,6,27,239,198,217,259,133,60,130,45,78,137,249,16,235,82,24,9,202,181,113,39,161,238,11,132,255,187,88,89,30,273,148,94,210,244,191,105,116,203,36,184,232,164,129,185,272,223,212,260,241,115,171,226,262,70,176,109,228,53,131,71,75,104,101,41,80,59,34,103,106,120,107,254,218,91,124,108,96,162,195,149,269,122,18,51,258,178,32,275,261,270,81,147,173,12,169,2,112,14,155,135,214,22,90,225,58,44,73,110,29,180,33,265,153,200,266,21,145,64,215,156,50,179,79,128,26,3,207,87,268,35,163,102,47,221,100,247,123,154,46,190,206,74,166,186,65,111,263,229,193,152,66,31,138,99,42,85,67,52,174,127,69,167,92,257,10,5,97,114,220,189,199,236,77,37,197,19,1,68,216,205,219,245,134,54,7,55,15,72,209,242,240,141,165,121,62,17,264,170,4,230,140,227,160};
            int curSum=randomList.length;

            for(int i=0;i<curSum;i++) {
                System.out.print(randomList[i]+",");
            }
            System.out.println();

            for(int i=0;i<curSum;i++) {

                if(i != 0 && i % 10 == 0) {
                    System.out.println("完成第"+iterNum+"轮迭代的第"+i+"次节点选择, 当前系统熵值为: "+systemEntropy);
                    if(Math.abs(systemEntropy - 0.0) < 0.0001) break;
                }

                int randValue = randomList[i];
                System.out.println("随机值: " + randValue);

                scanToFindBug();

                double testE = scanToComputeSystemEntropy();

                if(Math.abs(systemEntropy - testE) > 0.1) {
                    System.out.println("当前测试的熵值为: "+ testE);
                }
//
                if(randValue == 177) {
                    System.out.println("123");
                }

                cNum=classNodeList.size();//要不断更新cNum的值
                if(randValue<cNum) migrateClassNode(randValue);
                else migrateRelationNode(randValue - cNum);

            }
            System.out.println("isStable: "+isStable+" ,curIterNum:"+curIterNum);
            if(isStable&&curIterNum>=1) break;
            else if(isStable) curIterNum++;
            else curIterNum=0;

            System.out.println("当前系统熵值为: "+systemEntropy);
        }

        System.out.println("算法运行结束时间为: " + df.format(new Date()));

        scanToFindBug();
        scanToValidateData();
        System.out.println("算法运行结束,系统熵值为: "+systemEntropy);
        System.out.println("验证熵值为: " + scanToComputeSystemEntropy());
        System.out.println("迭代结束啦~");
    }

    private void migrateClassNode(int classNodeListId) {
        ClassNode classNode = classNodeList.get(classNodeListId);
        if(classNode.getIcmSet().size()==0) return ;
        Map<String,Set<Long>> userSetMap = migrateUtil.getTheUserSetForClassNode(classNode);
        //找到所有和当前classNode有交集的其他classNode节点
        Set<Integer> needToFindCNodeListIdSet = migrateUtil.findConClassNodes(classNode);

        if(classNode.getIcmSet().size()>=1) {

            for(String userKey : userSetMap.keySet()) {
                Set<Long> uSet = userSetMap.get(userKey);
//                if(uSet.size()==0||uSet.size()==1) continue;
                if(uSet.size() == 0) continue;
                else findLowerEntropyLocForClass(uSet,classNodeListId,needToFindCNodeListIdSet);
            }
        }
    }

    private void migrateRelationNode(int relationNodeListId) {
        RelationNode relationNode = relationNodeList.get(relationNodeListId);
        if(relationNode.getIcmSet().size()==0) return ;
        Map<String,Set<Long>> userSetMap = migrateUtil.getTheUserSetForRelationNode(relationNode);

        Set<Integer> needToFindRNodeListIdSet = migrateUtil.findConRelationNodes(relationNode);

        if(relationNode.getIcmSet().size()>=1) {
            for(String userKey : userSetMap.keySet()) {
                Set<Long> uSet = userSetMap.get(userKey);
//                if(uSet.size()==0||uSet.size()==1) continue;
                if(uSet.size() == 0) continue;
                else findLowerEntropyLocForRelation(uSet , relationNodeListId , needToFindRNodeListIdSet);
            }
        }
    }

    private void findLowerEntropyLocForClass(Set<Long> icmSet , int sourceClassNodeListId ,
                                             Set<Integer> needToFindCNodeListIdSet) {
        //注意,这里的ListId不是Node本身的id,而是classNodeList中该节点的id.
        //!!!要区分ListId和Id的区别
        double maxEntropyDecrease = 0.0;
        ClassNode sourceClassNode = classNodeList.get(sourceClassNodeListId);
        int targetClassNodeListId = -1; //因为我们目标是全局最小的熵值节点
        int icmSetSize = icmSet.size();
        boolean isTravseNullNode = false;//标注是否遍历过包含0用户的节点(即空节点)
        Set<Integer> haveConNodeIdSet = new HashSet<>();//有公共用户的节点集合

        double testE3 = scanToComputeSystemEntropy();

        for(Integer tmpListId : needToFindCNodeListIdSet) {
            ClassNode tmpCNode = classNodeList.get(tmpListId);

            boolean targetIsNullFlag = false;
            if(isTravseNullNode && tmpCNode.getIcmSet().size()==0) continue;
            if(tmpCNode.getIcmSet().size() == 0) {
                isTravseNullNode = true;
                targetIsNullFlag = true;
            }
            Set<Long> tmpResSet = new HashSet<>(tmpCNode.getIcmSet());
            tmpResSet.retainAll(icmSet);
            if(tmpResSet.size()!=0) {
                haveConNodeIdSet.add(tmpCNode.getLoc());
                continue;
            }

            double var = simulateMigrateForClass(icmSet , sourceClassNode , tmpCNode , targetIsNullFlag);
            if((Double.compare(maxEntropyDecrease , var) > 0 && Math.abs(maxEntropyDecrease - var) > 0.00001)
                    || (Double.compare(var,maxEntropyDecrease) == 0
                    && sourceClassNode.getIcmSet().size() - icmSetSize == 0 && tmpCNode.getIcmSet().size() != 0)) {
                maxEntropyDecrease = var;
                targetClassNodeListId = tmpCNode.getLoc();
            }
        }

        //除了将用户迁移到不包含该用户的节点上之外,还有两部分的工作要做
        //1: 判断该用户自己迁移到一个新的节点上,系统熵值是否会下降
        if(!isTravseNullNode) {
            ClassNode classNode2 = new ClassNode();
            double var2 = simulateMigrateForClass(icmSet,sourceClassNode,classNode2,true);
            if(Double.compare(maxEntropyDecrease , var2) > 0 && Math.abs(maxEntropyDecrease - var2) > 0.00001) {
//              classNodeRepository.save(classNode2);//在数据库中保存该节点
                classNodeList.add(classNode2);//在classNodeList中添加节点classNode2
                classNode2.setLoc(classNodeList.size()-1);
                classNode2.setId(curIdLoc++);
                maxEntropyDecrease = var2;
                targetClassNodeListId = classNode2.getLoc();
            }
        }

        if(targetClassNodeListId!=-1) {
            if(sourceClassNode.getIcmSet().size()-icmSetSize==0) this.nodeSum--;
            if(classNodeList.get(targetClassNodeListId).getIcmSet().size() == 0) this.nodeSum++;
            double testE2 = scanToComputeSystemEntropy();

            migrateClassNodeForOneStep(icmSet , sourceClassNodeListId , targetClassNodeListId);
            reComputeMigrateClassNodeEntropy(sourceClassNodeListId,targetClassNodeListId);
            removeNullEdgeForClassNode(sourceClassNodeListId);//删除多余边
            systemEntropy += maxEntropyDecrease;

            double testE = scanToComputeSystemEntropy();
            if(Math.abs(systemEntropy - testE) > 0.1) {
                System.out.println("发生熵值不等错误0001: "+"系统熵值: "+systemEntropy+" ,测试熵值: "+testE+",初始节点Listid: "+sourceClassNodeListId+"目标节点Listid:"+targetClassNodeListId);
            }
            System.out.println("发生迁移操作,用户集合为:"+icmSet+" ,sourceClassNodeListId为:"+sourceClassNodeListId+
                    " ,targetClassNodeListId为:"+targetClassNodeListId);
            isStable=false;//记录当前程序是否发生过迁移
            return;
        }


        //2: 说明整个集合一起迁移这种想法没有成功，下面就来单独迁移了
        if(targetClassNodeListId==-1) {
            Set<Long> curIcmIdSet = new HashSet<Long>(icmSet);
            if(icmSetSize > 1) {//这段代码是指当用户数大于1时，由于之前的迁移遗漏了部分节点，所以现在要把他们重新遍历
                for(Integer listId : haveConNodeIdSet) {
                    ClassNode tmpCNode = classNodeList.get(listId);
                    Set<Long> tmpResSet = new HashSet<>(tmpCNode.getIcmSet());
                    if(tmpResSet.size()==0) continue;
                    tmpResSet.retainAll(curIcmIdSet);//就是获得当前节点与curIcmIdSet中重合的节点数
                    Set<Long> curResSet = new HashSet<>(curIcmIdSet);
                    curResSet.removeAll(tmpResSet);
                    if(curResSet.size() == 0) continue;
                    double var = simulateMigrateForClass(curResSet , sourceClassNode , tmpCNode , false);
                    if((Double.compare(0.0 , var) > 0 && Math.abs(0.0 - var) > 0.00001)) {
                        migrateClassNodeForOneStep(curResSet , sourceClassNodeListId , tmpCNode.getLoc());
                        reComputeMigrateClassNodeEntropy(sourceClassNodeListId,tmpCNode.getLoc());
                        removeNullEdgeForClassNode(sourceClassNodeListId);//删除多余边
                        systemEntropy += var;

                        double testE = scanToComputeSystemEntropy();
                        if(Math.abs(systemEntropy - testE) > 0.1) {
                            System.out.println("发生熵值不等错误0001: "+"系统熵值: "+systemEntropy+" ,测试熵值: "+testE+",初始节点Listid: "+sourceClassNodeListId+"目标节点Listid:"+targetClassNodeListId);
                        }
                        System.out.println("发生迁移操作,用户集合为:"+curResSet+" ,sourceClassNodeListId为:"+sourceClassNodeListId+
                                " ,targetClassNodeListId为:"+tmpCNode.getLoc());

                        curIcmIdSet.removeAll(curResSet);
                    }
                    if(curIcmIdSet.size()==0) break;
                }
            }


            for(Long curIcmId : curIcmIdSet) {
                for(Integer listId : haveConNodeIdSet) {
                    if(classNodeList.get(listId).getIcmSet().contains(curIcmId)) {
                        double testE2 = scanToComputeSystemEntropy();

                        double twoStepVar=migrateClassNodeNeedTwoStep(curIcmId , sourceClassNodeListId ,listId);
                        if(Double.compare(twoStepVar,0.0)<0 && Math.abs(twoStepVar-0.0)>0.00001) {
                            isStable=false;
                            return;//这部分搞定就可以直接结束了
                        }
                        double testE = scanToComputeSystemEntropy();
                        if(Math.abs(systemEntropy - testE) > 0.1) {
                            System.out.println("发生熵值不等错误0003: "+"系统熵值: "+systemEntropy+" ,测试熵值: "+testE+"," +
                                    "初始节点Listid: "+sourceClassNodeListId+"目标节点Listid:"+listId);
                        }
                    }else continue;
                }
            }
        }
    }

    private boolean isContainValueNodeForClass(Integer targetCNodeLocId,ValueNode valueNode) {
        for(ClassToValueEdge ctvEdge : valueNode.getCtvEdges()) {
            if(ctvEdge.getStarter().getLoc()==targetCNodeLocId) return true;
        }
        return false;
    }

    private boolean isContainRelationNodeForClass(Integer targetCNodeLocId,RelationNode relationNode) {
        for(RelationToClassEdge rtcEdge : relationNode.getRtcEdges()) {
            if(rtcEdge.getEnder().getLoc()==targetCNodeLocId) return true;
        }
        return false;
    }

    private double simulateMigrateForClass(Set<Long> icmSet,ClassNode sourceCNode,ClassNode targetCNode,boolean targetIsNullFlag) {
        double sumEntropyVar=0.0;
        double var=0.0;//其他熵值变化

        double simulateMigrateBiEntropy = 0.0;
        simulateMigrateBiEntropy += sourceCNode.getBiEntropyValue();
        simulateMigrateBiEntropy += targetCNode.getBiEntropyValue();

        int simulateNodeSum = this.nodeSum;
        int icmSize = icmSet.size();

        if(targetIsNullFlag) simulateNodeSum++;//目标节点从空节点变为了非空节点,自然simulateNodeSum++了
        if(sourceCNode.getIcmSet().size() - icmSize ==0) simulateNodeSum--;//源节点从非空节点变为空节点,则simulateNodeSum--了

        Map<String,List<Set<Long>>> newSourceMap=new HashMap<>();
        Map<String,List<Set<Long>>> newTargetMap=new HashMap<>();

        Set<Long> dupVNodeSet=new HashSet<>();//判断是否会出现重复切换某一个点
        List<Long> emergeVIdList=new ArrayList<>();
        List<String> emergeVNameList=new ArrayList<>();
        Long oneIcmId = icmSet.iterator().next();//取出其中一个用户,作为标杆
        for(ClassToValueEdge ctvEdge : sourceCNode.getCtvEdges()) {
            int usize=ctvEdge.getIcmSet().size();
            if(usize==0) continue;
            String edgeName=ctvEdge.getName();
            if(ctvEdge.getIcmSet().contains(oneIcmId)) {//只要包含标杆用户,则说明当前边包含了当前用户集合
                usize-=icmSize;
                ValueNode valueNode=ctvEdge.getEnder();
                emergeVIdList.add(valueNode.getId());
                emergeVNameList.add(edgeName);
                if(dupVNodeSet.contains(valueNode.getId()));
                else {
                    dupVNodeSet.add(valueNode.getId());
                    simulateMigrateBiEntropy += valueNode.getBiEntropyValue();
                    if(isContainValueNodeForClass(targetCNode.getLoc(),valueNode) || usize>0)
                        var+=migrateUtil.MigrateFromClassToClassForValueNode(icmSet,valueNode,sourceCNode,
                            targetCNode,nodeSum,simulateNodeSum);
                    else {
                        var+=(valueNode.getBiEntropyValue())*(simulateNodeSum-nodeSum);
                    }
                }
            }

            Set<Long> tTmp=new HashSet<>(ctvEdge.getIcmSet());
            //这步是填充newSourceMap的
            if(usize==0) continue;
            if(usize!=tTmp.size()) {
                tTmp.removeAll(new HashSet<Long>(icmSet));
            }
            if(!newSourceMap.containsKey(edgeName)) {
                List<Set<Long>> refU=new ArrayList<>();
                refU.add(tTmp);
                newSourceMap.put(edgeName,refU);
            }else {
                newSourceMap.get(edgeName).add(tTmp);
            }
        }

        Set<Long> dupRNodeSet=new HashSet<>();//判断是否会出现一个relation两条边指向一个class
        List<Long> emergeRIdList=new ArrayList<>();
        List<String> emergeRNameList=new ArrayList<>();
        List<String> emergeRPortList=new ArrayList<>();
        for(RelationToClassEdge rtcEdge : sourceCNode.getRtcEdges()) {
            int usize=rtcEdge.getIcmSet().size();
            if(usize==0) continue;
            String edgeName=rtcEdge.getName();
            String port=rtcEdge.getPort();
            if(rtcEdge.getIcmSet().contains(oneIcmId)) {
                usize-=icmSize;
                RelationNode relationNode=rtcEdge.getStarter();
                emergeRIdList.add(relationNode.getId());
                emergeRNameList.add(edgeName);
                emergeRPortList.add(port);
                if(dupRNodeSet.contains(relationNode.getId()));
                else {
                    dupRNodeSet.add(relationNode.getId());
                    simulateMigrateBiEntropy += relationNode.getBiEntropyValue();
//                    double tttmpVar = migrateUtil.MigrateFromClassToClassForRelationNode(icmSet,relationNode,sourceCNode,
//                            targetCNode,nodeSum,simulateNodeSum);
                    if(isContainRelationNodeForClass(targetCNode.getLoc(),relationNode) || usize>0)
                        var+=migrateUtil.MigrateFromClassToClassForRelationNode(icmSet,relationNode,sourceCNode,
                            targetCNode,nodeSum,simulateNodeSum);
                    else {
                        var+=(relationNode.getBiEntropyValue())*(simulateNodeSum-nodeSum);
                    }
                }
            }

            Set<Long> tTmp=new HashSet<>(rtcEdge.getIcmSet());
            //这步是填充newSourceMap的
            if(usize==0) continue;
            if(usize!=tTmp.size()) {
                tTmp.removeAll(new HashSet<Long>(icmSet));
            }
            if(!newSourceMap.containsKey(edgeName)) {
                List<Set<Long>> refU=new ArrayList<>();
                refU.add(tTmp);
                newSourceMap.put(edgeName,refU);
            }else {
                newSourceMap.get(edgeName).add(tTmp);
            }
        }

        //上述这两步完成了对newSourceMap的构建,接下来是newTargetMap的构建

        for(ClassToValueEdge ctvEdge:targetCNode.getCtvEdges()) {
            String edgeName=ctvEdge.getName();
            int usize=ctvEdge.getIcmSet().size();
            Long vId=ctvEdge.getEnder().getId();
            int emVSize=emergeVIdList.size();
            for(int i=0;i<emVSize;i++) {
                Long emergeVId=emergeVIdList.get(i);
                String emergeEdgeName=emergeVNameList.get(i);
                if(emergeVId!=vId||!emergeEdgeName.equals(edgeName)) continue;
                usize+=icmSize;
                emergeVIdList.remove(i);
                emergeVNameList.remove(i);
                break;
            }

            if(usize==0) continue;
            Set<Long> tTmp=new HashSet<>(ctvEdge.getIcmSet());
            if(usize!=tTmp.size()) {
                tTmp.addAll(new HashSet<Long>(icmSet));
            }
            if(!newTargetMap.containsKey(edgeName)) {
                List<Set<Long>> refU=new ArrayList<>();
                refU.add(tTmp);
                newTargetMap.put(edgeName,refU);
            }else {
                newTargetMap.get(edgeName).add(tTmp);
            }
        }

        for(RelationToClassEdge rtcEdge:targetCNode.getRtcEdges()) {
            String edgeName=rtcEdge.getName();
            String port=rtcEdge.getPort();
            int usize=rtcEdge.getIcmSet().size();
            Long rId=rtcEdge.getStarter().getId();
            int emRSize=emergeRIdList.size();
            for(int i=0;i<emRSize;i++) {
                Long emergeRId=emergeRIdList.get(i);
                String emergeEdgeName=emergeRNameList.get(i);
                String emergePort=emergeRPortList.get(i);
                if(emergeRId!=rId||!emergeEdgeName.equals(edgeName)||!emergePort.equals(port)) continue;
                usize+=icmSize;
                emergeRIdList.remove(i);
                emergeRNameList.remove(i);
                emergeRPortList.remove(i);
                break;
            }

            if(usize==0) continue;
            Set<Long> tTmp=new HashSet<>(rtcEdge.getIcmSet());
            if(usize!=tTmp.size()) {
                tTmp.addAll(new HashSet<Long>(icmSet));
            }
            if(!newTargetMap.containsKey(edgeName)) {
                List<Set<Long>> refU=new ArrayList<>();
                refU.add(tTmp);
                newTargetMap.put(edgeName,refU);
            }else {
                newTargetMap.get(edgeName).add(tTmp);
            }
        }

        int emergeVIdListSize = emergeVIdList.size();
        int emergeRIdListSize = emergeRIdList.size();
        for(int i=0;i<emergeVIdListSize;i++) {
            Set<Long> tTmp=new HashSet<>(icmSet);
            String edgeName=emergeVNameList.get(i);
            if(!newTargetMap.containsKey(edgeName)) {
                List<Set<Long>> refU=new ArrayList<>();
                refU.add(tTmp);
                newTargetMap.put(edgeName,refU);
            }else {
                newTargetMap.get(edgeName).add(tTmp);
            }
        }

        for(int i=0;i<emergeRIdListSize;i++) {
            Set<Long> tTmp=new HashSet<>(icmSet);
            String edgeName=emergeRNameList.get(i);
            if(!newTargetMap.containsKey(edgeName)) {
                List<Set<Long>> refU=new ArrayList<>();
                refU.add(tTmp);
                newTargetMap.put(edgeName,refU);
            }else {
                newTargetMap.get(edgeName).add(tTmp);
            }
        }

        //完成了newTargetMap的构建
//        double oldSourceEntropy=entropyHandler.computeMapEntropy(oldSourceMap,nodeSum);
        double oldSourceEntropy = sourceCNode.getBiEntropyValue()*nodeSum;
        double newSourceEntropy=entropyHandler.computeMapEntropy(newSourceMap, simulateNodeSum);
//        double oldTargetEntropy=entropyHandler.computeMapEntropy(oldTargetMap,nodeSum);
        double oldTargetEntropy = targetCNode.getBiEntropyValue()*nodeSum;
        double newTargetEntropy=entropyHandler.computeMapEntropy(newTargetMap, simulateNodeSum);

        //获取变化的var值
        double sourceVar=newSourceEntropy-oldSourceEntropy;
        double targetVar=newTargetEntropy-oldTargetEntropy;
        sumEntropyVar+=var;
        sumEntropyVar+=sourceVar;
        sumEntropyVar+=targetVar;

        double simulateMigrateEntropy = simulateMigrateBiEntropy*nodeSum;
        double unChangeBiEntropy = (systemEntropy - simulateMigrateEntropy)/nodeSum;
        double migratedSystemEntropy = unChangeBiEntropy * simulateNodeSum + simulateMigrateEntropy + sumEntropyVar;
        double resVar = migratedSystemEntropy - systemEntropy;

        return resVar;
    }

    /**
     * 将用户集合从一个class节点迁移到另一个class节点,这个是一步的,因为另一个class节点一定不包含该用户集合
     * @param icmSet
     * @param sourceClassNodeListId
     * @param targetClassNodeListId
     */
    public void migrateClassNodeForOneStep(Set<Long> icmSet,int sourceClassNodeListId,int targetClassNodeListId) {
        //这个地方涉及数据库的操作,我必须要非常小心这一点
        ClassNode sourceClassNode=classNodeList.get(sourceClassNodeListId);
        ClassNode targetClassNode=classNodeList.get(targetClassNodeListId);

//        sourceClassNode.getIcmSet().removeAll(icmSet);
//        targetClassNode.getIcmSet().addAll(icmSet);

        sourceClassNode.removeIcmSetFromSet(icmSet);
        targetClassNode.addIcmSetFromSet(icmSet);

        Long oneIcmId = icmSet.iterator().next();//获取一个标杆icm

        for(ClassToValueEdge ctvEdge2 : targetClassNode.getCtvEdges())
            ctvEdge2.setIsChanged(false);

        //对于sourceClassNode的classToValue部分
        for(ClassToValueEdge ctvEdge : sourceClassNode.getCtvEdges()) {
            ctvEdge.setIsChanged(false);
            if(ctvEdge.getIcmSet().size()==0||!ctvEdge.getIcmSet().contains(oneIcmId)) {
                continue;
            }

            ctvEdge.setIcmSetPreCopy(new HashSet<>(ctvEdge.getIcmSet()));//将这个存储一个备份
            ctvEdge.setIsChanged(true);//标记这个值被改变了

//            ctvEdge.getIcmSet().removeAll(icmSet);
            ctvEdge.removeIcmSetFromSet(icmSet);
            String edgeName=ctvEdge.getName();
            ValueNode valueNode=ctvEdge.getEnder();
            //下面要把该边上的该用户从sourceClassNode迁移到targetClassNode

            boolean isContainFlag=false;
            for(ClassToValueEdge ctvEdge2 : targetClassNode.getCtvEdges()) {
                if (ctvEdge2.getName().equals(edgeName) && ctvEdge2.getEnder().equals(valueNode)) {
                    ctvEdge2.setIcmSetPreCopy(new HashSet<Long>(ctvEdge2.getIcmSet()));//将这个存储一个备份
                    ctvEdge2.setIsChanged(true);
                    isContainFlag=true;
//                    ctvEdge2.getIcmSet().addAll(icmSet);
                    ctvEdge2.addIcmSetFromSet(icmSet);
                    break;
                }else;
            }
            if(!isContainFlag) {//说明在上面的遍历过程中并没有找到这个边
                Set<Long> tTmpSet=new HashSet<>();
                tTmpSet.addAll(icmSet);
                ClassToValueEdge tmpCtvEdge=new ClassToValueEdge(edgeName,targetClassNode,valueNode);
                tmpCtvEdge.setIcmSet(tTmpSet);
                tmpCtvEdge.setIsChanged(true);
                tmpCtvEdge.setIcmSetPreCopy(new HashSet<Long>());
                tmpCtvEdge.setId(curIdLoc++);
                targetClassNode.getCtvEdges().add(tmpCtvEdge);
                valueNode.getCtvEdges().add(tmpCtvEdge);
//                classToVEdgeRepository.save(tmpCtvEdge);//classToVEdgeRepository这个
            }
        }

        //对于sourceClassNode的relationToClass部分
        //先把targetClassNode的rtc边全部置为false的flag标志
        for(RelationToClassEdge rtcEdge2 : targetClassNode.getRtcEdges())
            rtcEdge2.setIsChanged(false);

        for(RelationToClassEdge rtcEdge : sourceClassNode.getRtcEdges()) {
            rtcEdge.setIsChanged(false);
            if(rtcEdge.getIcmSet().size()==0||!rtcEdge.getIcmSet().contains(oneIcmId)) {
                continue;
            }
            rtcEdge.setIcmSetPreCopy(new HashSet<>(rtcEdge.getIcmSet()));//将这个存储一个备份
            rtcEdge.setIsChanged(true);
//            rtcEdge.getIcmSet().removeAll(icmSet);
            rtcEdge.removeIcmSetFromSet(icmSet);
            String port=rtcEdge.getPort();
            String edgeName=rtcEdge.getName();
            RelationNode relationNode=rtcEdge.getStarter();
            //下面要把改变上的该用户从sourceClassNode迁移到targetClassNode上去
            boolean isContainFlag=false;
            for(RelationToClassEdge rtcEdge2 : targetClassNode.getRtcEdges()) {
                if(rtcEdge2.getPort().equals(port)&&rtcEdge2.getName().equals(edgeName)
                        &&rtcEdge2.getStarter().equals(relationNode)) {
                    rtcEdge2.setIcmSetPreCopy(new HashSet<Long>(rtcEdge2.getIcmSet()));//将这个存储一个备份
                    rtcEdge2.setIsChanged(true);
                    isContainFlag=true;
//                    rtcEdge2.getIcmSet().addAll(icmSet);
                    rtcEdge2.addIcmSetFromSet(icmSet);
                    break;
                }
            }
            if(!isContainFlag) {//说明在上面的遍历过程中并没有找到这个边
                Set<Long> tTmpSet=new HashSet<>();
                tTmpSet.addAll(icmSet);
                RelationToClassEdge tmpRtcEdge=new RelationToClassEdge(port,edgeName,relationNode,targetClassNode);
                tmpRtcEdge.setIcmSet(tTmpSet);
                tmpRtcEdge.setId((long)(curIdLoc++));
                targetClassNode.getRtcEdges().add(tmpRtcEdge);
                tmpRtcEdge.setIsChanged(true);
                tmpRtcEdge.setIcmSetPreCopy(new HashSet<Long>());
                relationNode.getRtcEdges().add(tmpRtcEdge);
//                relationToCEdgeRepository.save(tmpRtcEdge);
            }
        }
    }

    /**
     * 将用户从一个class节点迁移到另一个class节点,这个是一步的,因为另一个class节点一定不包含该用户
     * @param icmId
     * @param sourceClassNodeListId
     * @param targetClassNodeListId
     */


    /**
     * 目标是返回当前sourceClass上的用户迁移到targetClass上系统熵值减小/增加幅度
     * @param icmId
     * @param sourceClassNodeListId
     * @param targetClassNodeListId
     */
    public Double migrateClassNodeNeedTwoStep(Long icmId,int sourceClassNodeListId,int targetClassNodeListId) {
        //首先是判断如果targetClass没有当前icmId用户,将sourceClass上的icmId迁移到targetClass上是否会减小熵值,如果会则执行该步骤,否则不执行
        //为targetClass上的icmId用户找寻适合其迁移的最佳位置,判断这个迁移会造成多少熵值增加
        //如果增加的比迁移过来的减少的少,则进行迁移操作,否则不迁移
        ClassNode sourceClassNode=classNodeList.get(sourceClassNodeListId);
        ClassNode targetClassNode=classNodeList.get(targetClassNodeListId);
        Set<Long> curIdSet = new HashSet<>();
        curIdSet.add(icmId);

        //由于在模拟迁移之后若系统总熵值不能减小,我们则需要将这些节点还原

        double minEntropyDown=0x7FFFFFFF;
        Integer minVarCNodeListId=-1;  //我们希望找到的是引起targetClass节点迁移到的目标节点熵值上升度最小的节点
        Boolean isTravseNUllNode=false;  //是否遍历空节点的情况

        Set<Integer> thirdPartCNodeListIdSet = migrateUtil.findConClassNodes(targetClassNode);

        //这里的目标是把target上的class节点迁移到otherClassNode上去,看看是否有效果
        for(Integer tmpListId : thirdPartCNodeListIdSet) {
            ClassNode otherClassNode = classNodeList.get(tmpListId);
            boolean targetIsNullFlag = false;
            if(isTravseNUllNode && otherClassNode.getIcmSet().size()==0) continue;
            if(otherClassNode.getIcmSet().size() == 0) {
                targetIsNullFlag=true;
                isTravseNUllNode=true;
            }
            if(otherClassNode.getIcmSet().contains(icmId)) continue;
            double var=simulateMigrateForClass(curIdSet,targetClassNode,otherClassNode,targetIsNullFlag);
            if((Double.compare(minEntropyDown,var)>0 && Math.abs(minEntropyDown - var) > 0.00001 )
                    || (Double.compare(var,minEntropyDown)==0 &&
                    targetClassNode.getIcmSet().size() == 1 && otherClassNode.getIcmSet().size() != 0)) {
                minEntropyDown=var;
                minVarCNodeListId=otherClassNode.getLoc();
            }
        }

        boolean isUsedNullNode = false;//是否使用了空节点
        if(!isTravseNUllNode && targetClassNode.getIcmSet().size()!=1) {
            ClassNode tClassNode=new ClassNode();
            double var=simulateMigrateForClass(curIdSet,targetClassNode,tClassNode,true);
            if(Double.compare(minEntropyDown,var)>0 && Math.abs(minEntropyDown - var) > 0.00001) {
                isUsedNullNode=true;
                minEntropyDown=var;
                classNodeList.add(tClassNode);
                tClassNode.setLoc(classNodeList.size()-1);
                tClassNode.setId(curIdLoc++);
                minVarCNodeListId=tClassNode.getLoc();
            }else tClassNode=null;
        }

        int recoverNodeSum = this.nodeSum;//将nodeSum的值保存起来了
        double recoverSystemEntropy = systemEntropy;

        if(minVarCNodeListId!=-1) {//说明确实找到了可以让该节点熵值下降的通道

            //将targetClass上的icmId正式迁移到minVarCNodeId节点上去
            if(classNodeList.get(targetClassNodeListId).getIcmSet().size()==1) this.nodeSum--;
            if(classNodeList.get(minVarCNodeListId).getIcmSet().size()==0) this.nodeSum++;
            migrateClassNodeForOneStep(curIdSet, targetClassNodeListId, minVarCNodeListId);

            systemEntropy += minEntropyDown;
            reComputeMigrateClassNodeEntropy(targetClassNodeListId,minVarCNodeListId);
            //如果需要恢复到迁移前,则在下面启动恢复过程
        }else return 0.0;
        //上面这个migrateClassNodeForOneStep实实在在的把targetClassNode上的icmId迁移到了minVarCNodeId对应节点上

        boolean secondStepFlag=false;
        if(targetClassNode.getIcmSet().size()==0) secondStepFlag=true;
        double simVar=simulateMigrateForClass(curIdSet,sourceClassNode,targetClassNode,secondStepFlag);
        if((Double.compare(simVar,0.0)>=0 && Math.abs(simVar-0.0)>0.00001) || Math.abs(simVar - 0.0)<0.00001) {
            //说明这步迁移是没有意义的,我们接下来判断刚才的迁移是否需要复原
            if(Double.compare(minEntropyDown,0.0) > 0 ||
                    ((Double.compare(minEntropyDown,0.0) == 0 || Math.abs(minEntropyDown - 0.0)<0.00001)
                            && !(targetClassNode.getIcmSet().size() == 0 &&
                            classNodeList.get(minVarCNodeListId).getIcmSet().size()>1)) ) {
                //需要复原之前的迁移
                recoverMigrateStateForClassNode(icmId,targetClassNodeListId,minVarCNodeListId,isUsedNullNode);
                recoverEdgeStateForClassNode(targetClassNodeListId);
                recoverEdgeStateForClassNode(minVarCNodeListId);
                recoverMigrateClassNode(targetClassNodeListId,minVarCNodeListId);
                removeRecoverClassNullNode(minVarCNodeListId);
                systemEntropy = recoverSystemEntropy;
                this.nodeSum=recoverNodeSum;
            }else {
                removeNullEdgeForClassNode(targetClassNodeListId);
                System.out.println("发生双步迁移操作:首步成功,用户编号:"+icmId+" ,targetClassNodeListId为:"+targetClassNodeListId+
                        " ,minVarCNodeListId为:"+minVarCNodeListId);
                isStable=false;
            }//不需要复原
        }else {
            //说明当前的迁移是有意义的,但是我们还是需要判断这次两步迁移是否会造成系统熵值上升
            double tmpSimVar=-simVar;//将负值先转换为正的
            if(Double.compare(minEntropyDown,0.0)>0 ||
                    (Double.compare(minEntropyDown,0.0) == 0 && !(targetClassNode.getIcmSet().size() == 0 &&
                            classNodeList.get(minVarCNodeListId).getIcmSet().size()>1))) {
                double resSimVar=tmpSimVar-minEntropyDown;
                if(Double.compare(resSimVar,0.0)>=0) {//说明迁移后系统熵值减小,这是成功的
                    if(classNodeList.get(sourceClassNodeListId).getIcmSet().size()==1) this.nodeSum--;
                    if(classNodeList.get(targetClassNodeListId).getIcmSet().size()==0) this.nodeSum++;
                    removeNullEdgeForClassNode(targetClassNodeListId);
                    migrateClassNodeForOneStep(curIdSet,sourceClassNodeListId,targetClassNodeListId);
                    reComputeMigrateClassNodeEntropy(sourceClassNodeListId, targetClassNodeListId);
                    removeNullEdgeForClassNode(sourceClassNodeListId);
                    systemEntropy += simVar;
                    isStable=false;
                    System.out.println("发生双步迁移操作:首步成功,用户编号:"+icmId+" ,targetClassNodeListId为:"+
                            targetClassNodeListId+ " ,minVarCNodeListId为:"+minVarCNodeListId);
                    System.out.println("发生双步迁移操作:次步成功,用户编号:"+icmId+" ,sourceClassNodeListId为:"+
                            sourceClassNodeListId+ " ,targetClassNodeListId为:"+targetClassNodeListId);
                }else {//resSimVar<0.0说明系统熵值总体上升了,因此必须回复全部初始数据
                    recoverMigrateStateForClassNode(icmId,targetClassNodeListId,minVarCNodeListId,isUsedNullNode);//还原节点的原有格局
                    recoverEdgeStateForClassNode(targetClassNodeListId);
                    recoverEdgeStateForClassNode(minVarCNodeListId);
                    recoverMigrateClassNode(targetClassNodeListId,minVarCNodeListId);
                    removeRecoverClassNullNode(minVarCNodeListId);
                    this.nodeSum=recoverNodeSum;
                    systemEntropy = recoverSystemEntropy;
                }
            }else {
                //成功,我们需要将souceClass上的icmId用户迁移到targetClass上去
                if(classNodeList.get(sourceClassNodeListId).getIcmSet().size()==1) this.nodeSum--;
                if(classNodeList.get(targetClassNodeListId).getIcmSet().size()==0) this.nodeSum++;
                removeNullEdgeForClassNode(targetClassNodeListId);
                migrateClassNodeForOneStep(curIdSet,sourceClassNodeListId,targetClassNodeListId);
                reComputeMigrateClassNodeEntropy(sourceClassNodeListId,targetClassNodeListId);
                removeNullEdgeForClassNode(sourceClassNodeListId);
                systemEntropy += simVar;
                isStable=false;
                System.out.println("发生双步迁移操作:首步成功,用户编号:"+icmId+" ,targetClassNodeListId为:"+
                        targetClassNodeListId+ " ,minVarCNodeListId为:"+minVarCNodeListId);
                System.out.println("发生双步迁移操作:次步成功,用户编号:"+icmId+" ,sourceClassNodeListId为:"+
                        sourceClassNodeListId+ " ,targetClassNodeListId为:"+targetClassNodeListId);
            }
        }
        return simVar+minEntropyDown;
    }

    private void findLowerEntropyLocForRelation(Set<Long> icmSet , int sourceRelationNodeListId , Set<Integer> needToFindRNodeListIdSet) {
        RelationNode sourceRelationNode = relationNodeList.get(sourceRelationNodeListId);
        double maxEntropyDecrease=0.0;
        int targetRelationNodeId=-1;
        int icmSetSize = icmSet.size();
        boolean isNullNode=false;
        Set<Integer> haveConNodeIdSet = new HashSet<>();

        for(Integer tmpListId : needToFindRNodeListIdSet) {
            RelationNode tmpRNode = relationNodeList.get(tmpListId);

            boolean targetIsNullFlag = false;
            if(isNullNode&&tmpRNode.getIcmSet().size()==0) continue;
            if(tmpRNode.getIcmSet().size()==0) {
                isNullNode=true;
                targetIsNullFlag=true;
            }
            Set<Long> tmpResSet = new HashSet<>(tmpRNode.getIcmSet());
            tmpResSet.retainAll(icmSet);
            if(tmpResSet.size()!=0) {
                haveConNodeIdSet.add(tmpRNode.getLoc());
                continue;
            }

            double var=simulateMigrateForRelation(icmSet , sourceRelationNode , tmpRNode , targetIsNullFlag);
            if((Double.compare(maxEntropyDecrease,var)>0 && Math.abs(maxEntropyDecrease - var) > 0.00001)
                    || (Double.compare(var , maxEntropyDecrease) == 0 &&
                    sourceRelationNode.getIcmSet().size()-icmSet.size() == 0 && tmpRNode.getIcmSet().size() != 0)) {
                maxEntropyDecrease=var;
                targetRelationNodeId=tmpRNode.getLoc();
            }
        }

        //除了将用户迁移到不包含该用户的节点上之外,还有两部分的工作要做
        //1: 判断该用户自己迁移到一个新的节点上,系统熵值是否会下降
        if(!isNullNode) {
            RelationNode relationNode2=new RelationNode();
            double var2=simulateMigrateForRelation(icmSet , sourceRelationNode , relationNode2 , true);
            if(Double.compare(maxEntropyDecrease,var2)>0 && Math.abs(maxEntropyDecrease - var2) > 0.00001) {
                relationNodeList.add(relationNode2);
                relationNode2.setLoc(relationNodeList.size()-1);
                relationNode2.setId(curIdLoc++);
                maxEntropyDecrease=var2;
                targetRelationNodeId=relationNode2.getLoc();
            }
        }

        if(targetRelationNodeId!=-1) {
            if(sourceRelationNode.getIcmSet().size() - icmSet.size() == 0) this.nodeSum--;
            if(relationNodeList.get(targetRelationNodeId).getIcmSet().size() == 0) this.nodeSum++;
            migrateRelationNodeForOneStep(icmSet, sourceRelationNodeListId, targetRelationNodeId);
            reComputeMigrateRelationNodeEntropy(sourceRelationNodeListId,targetRelationNodeId);
            removeNullEdgeForRelationNode(sourceRelationNodeListId);

            systemEntropy += maxEntropyDecrease;

            double testE = scanToComputeSystemEntropy();
            if(Math.abs(systemEntropy - testE) > 0.1) {
                System.out.println("发生熵值不等错误0006: "+"系统熵值: "+systemEntropy+" ,测试熵值: "+testE+"," +
                        "初始节点Listid: "+sourceRelationNodeListId+"目标节点Listid:"+targetRelationNodeId);
            }
            System.out.println("发生迁移操作,用户集合:"+icmSet+" ,sourceRelationNodeListId为:"+
                    sourceRelationNodeListId+ " ,targetRelationNodeId为:"+targetRelationNodeId);
            isStable=false;//记录当前程序是否发生过迁移
            return;
        }

        //2: 判断该用户迁移到其他包含该用户的节点上,系统熵值是否会下降
        if(targetRelationNodeId==-1) {
            Set<Long> curIcmIdSet = new HashSet<>(icmSet);
            if(icmSetSize > 1) {//这段代码是指当用户数大于1时，由于之前的迁移遗漏了部分节点，所以现在要把他们重新遍历
                for(Integer listId : haveConNodeIdSet) {
                    RelationNode tmpRNode = relationNodeList.get(listId);
                    Set<Long> tmpResSet = new HashSet<>(tmpRNode.getIcmSet());
                    if(tmpResSet.size()==0) continue;
                    tmpResSet.retainAll(curIcmIdSet);//就是获得当前节点与curIcmIdSet中重合的节点数
                    Set<Long> curResSet = new HashSet<>(curIcmIdSet);
                    curResSet.removeAll(tmpResSet);
                    if(curResSet.size() == 0) continue;
                    double var = simulateMigrateForRelation(curResSet , sourceRelationNode , tmpRNode , false);
                    if((Double.compare(0.0 , var) > 0 && Math.abs(0.0 - var) > 0.00001)) {
                        migrateRelationNodeForOneStep(curResSet , sourceRelationNodeListId , tmpRNode.getLoc());
                        reComputeMigrateRelationNodeEntropy(sourceRelationNodeListId,tmpRNode.getLoc());
                        removeNullEdgeForRelationNode(sourceRelationNodeListId);//删除多余边
                        systemEntropy += var;

                        double testE = scanToComputeSystemEntropy();
                        if(Math.abs(systemEntropy - testE) > 0.1) {
                            System.out.println("发生熵值不等错误0005: "+"系统熵值: "+systemEntropy+" ,测试熵值: "+testE+"," +
                                    "初始节点Listid: "+sourceRelationNodeListId+"目标节点Listid:"+tmpRNode.getLoc());
                        }
                        System.out.println("发生迁移操作,用户集合为:"+curResSet+" ,sourceRelationNodeListId为:"+sourceRelationNodeListId+
                                " ,targetRelationNodeListId为:"+tmpRNode.getLoc());

                        curIcmIdSet.removeAll(curResSet);
                    }
                    if(curIcmIdSet.size()==0) break;
                }
            }

            for(Long curIcmId : curIcmIdSet) {
                for(Integer listId : haveConNodeIdSet) {
                    if(relationNodeList.get(listId).getIcmSet().contains(curIcmId)) {
                        double testE2 = scanToComputeSystemEntropy();
                        double twoStepVar=migrateRelationNodeNeedTwoStep(curIcmId , sourceRelationNodeListId ,listId);
                        double testE = scanToComputeSystemEntropy();
                        if(Math.abs(systemEntropy - testE) > 0.1) {
                            System.out.println("发生熵值不等错误0005: "+"系统熵值: "+systemEntropy+" ,测试熵值: "+testE+"," +
                                    "初始节点Listid: "+sourceRelationNodeListId+"目标节点Listid:"+listId);
                        }
                        if(Double.compare(twoStepVar,0.0)<0 && Math.abs(twoStepVar-0.0)>0.00001) {
                            isStable=false;
                            return;//这部分搞定就可以直接结束了
                        }
                    }else continue;
                }
            }
        }
    }

    private boolean isContainValueNodeForRelation(Integer targetRNodeLocId,ValueNode valueNode) {
        for(RelationToValueEdge rtvEdge : valueNode.getRtvEdges()) {
            if(rtvEdge.getStarter().getLoc()==targetRNodeLocId) return true;
        }
        return false;
    }

    private boolean isContainClassNodeForRelation(Integer targetRNodeLocId,ClassNode classNode) {
        for(RelationToClassEdge rtcEdge : classNode.getRtcEdges()) {
            if(rtcEdge.getStarter().getLoc()==targetRNodeLocId) return true;
        }
        return false;
    }

    private double simulateMigrateForRelation(Set<Long> icmSet,RelationNode sourceRNode,RelationNode targetRNode,boolean targetIsNullFlag) {
        double sumEntropyVar=0.0;
        double var=0.0;//其他熵值变化

        double simulateMigrateBiEntropy = 0.0;
        simulateMigrateBiEntropy += sourceRNode.getBiEntropyValue();
        simulateMigrateBiEntropy += targetRNode.getBiEntropyValue();

        int simulateNodeSum=this.nodeSum;
        int icmSetSize = icmSet.size();

        if(targetIsNullFlag) simulateNodeSum++;//目标节点为空节点,则将simulateNodeNum加加
        if(sourceRNode.getIcmSet().size()-icmSetSize==0) simulateNodeSum--;//源节点为单用户节点,则将simulateNodeNum减减

        Map<String,List<Set<Long>>> newSourceMap=new HashMap<>();
        Map<String,List<Set<Long>>> newTargetMap=new HashMap<>();

        Long oneIcmId = icmSet.iterator().next();

        Set<Long> dupVNodeSet=new HashSet<>();//判断是否会出现重复切换某一个点
        List<Long> emergeVIdList=new ArrayList<>();
        List<String> emergeVPortList=new ArrayList<>();
        List<String> emergeVNameList=new ArrayList<>();
        for(RelationToValueEdge rtvEdge : sourceRNode.getRtvEdges()) {
            int usize=rtvEdge.getIcmSet().size();
            if(usize==0) continue;
            String port=rtvEdge.getPort();
            String edgeName=rtvEdge.getName();
            if(rtvEdge.getIcmSet().contains(oneIcmId)) {//说明当前边包含了当前用户
                usize-=icmSetSize;
                ValueNode valueNode=rtvEdge.getEnder();
                emergeVIdList.add(valueNode.getId());
                emergeVPortList.add(port);
                emergeVNameList.add(edgeName);
                if(dupVNodeSet.contains(valueNode.getId()));
                else {
                    dupVNodeSet.add(valueNode.getId());
                    simulateMigrateBiEntropy += valueNode.getBiEntropyValue();
//                    double testVar = migrateUtil.MigrateFromRelationToRelationForValueNode(
//                            icmSet,valueNode,sourceRNode,targetRNode,nodeSum,simulateNodeSum);
                    double valueNodeVar = 0.0;
                    if(isContainValueNodeForRelation(targetRNode.getLoc(),valueNode) || usize>0)
                        valueNodeVar += migrateUtil.MigrateFromRelationToRelationForValueNode(
                                icmSet,valueNode,sourceRNode,targetRNode,nodeSum,simulateNodeSum);
                    else {
                        valueNodeVar += (valueNode.getBiEntropyValue())*(simulateNodeSum-nodeSum);
                    }
                    var += valueNodeVar;
//                    if(Math.abs(valueNodeVar-testVar)>0.00001) {
//                        System.out.println("error");
//                    }
                }
            }

            Set<Long> tTmp=new HashSet<>(rtvEdge.getIcmSet());
            //这步是填充newSourceMap的
            if(usize==0) continue;
            if(usize!=tTmp.size()) {
                tTmp.removeAll(icmSet);
            }
            if(!newSourceMap.containsKey(edgeName)) {
                List<Set<Long>> refU=new ArrayList<>();
                refU.add(tTmp);
                newSourceMap.put(edgeName,refU);
            }else {
                newSourceMap.get(edgeName).add(tTmp);
            }
        }

        Set<Long> dupCNodeSet=new HashSet<>();//判断是否会出现一个relation两条边指向一个class
        List<Long> emergeCIdList=new ArrayList<>();
        List<String> emergeCPortList=new ArrayList<>();
        List<String> emergeCNameList=new ArrayList<>();
        for(RelationToClassEdge rtcEdge : sourceRNode.getRtcEdges()) {
            int usize=rtcEdge.getIcmSet().size();
            if(usize==0) continue;
            String edgeName=rtcEdge.getName();
            String port=rtcEdge.getPort();
            if(rtcEdge.getIcmSet().contains(oneIcmId)) {
                usize--;
                ClassNode classNode=rtcEdge.getEnder();
                emergeCIdList.add(classNode.getId());
                emergeCPortList.add(port);
                emergeCNameList.add(edgeName);
                if(dupCNodeSet.contains(classNode.getId()));
                else {
                    dupCNodeSet.add(classNode.getId());
                    simulateMigrateBiEntropy += classNode.getBiEntropyValue();

//                    double testVar = migrateUtil.MigrateFromRelationToRelationForClassNode(
//                            icmSet,classNode,sourceRNode,targetRNode,nodeSum,simulateNodeSum);
                    double classNodeVar = 0.0;
                    if(isContainClassNodeForRelation(targetRNode.getLoc(),classNode) || usize>0)
                        classNodeVar+=migrateUtil.MigrateFromRelationToRelationForClassNode(
                            icmSet,classNode,sourceRNode,targetRNode,nodeSum,simulateNodeSum);
                    else {
                        classNodeVar+=classNode.getBiEntropyValue()*(simulateNodeSum-nodeSum);
                    }
                    var += classNodeVar;
//                    if(Math.abs(classNodeVar-testVar)>0.00001) {
//                        System.out.println("error");
//                    }
                }
            }

            Set<Long> tTmp=new HashSet<>(rtcEdge.getIcmSet());
            //这步是填充newSourceMap的
            if(usize==0) continue;
            if(usize!=tTmp.size()) {
                tTmp.removeAll(icmSet);
            }
            if(!newSourceMap.containsKey(edgeName)) {
                List<Set<Long>> refU=new ArrayList<>();
                refU.add(tTmp);
                newSourceMap.put(edgeName,refU);
            }else {
                newSourceMap.get(edgeName).add(tTmp);
            }
        }

        //上述这两步完成了对newSourceMap的构建,接下来是newTargetMap的构建
        for(RelationToValueEdge rtvEdge:targetRNode.getRtvEdges()) {
            String port=rtvEdge.getPort();
            String edgeName=rtvEdge.getName();
            int usize=rtvEdge.getIcmSet().size();
            Long vId=rtvEdge.getEnder().getId();
            int emVSize=emergeVIdList.size();//这个是记录了sourceRNode所连接的value节点中包含有curIcmId的个数
            for(int i=0;i<emVSize;i++) {
                Long emergeVId=emergeVIdList.get(i);
                String emergePort=emergeVPortList.get(i);
                String emergeEdgeName=emergeVNameList.get(i);
                if(emergeVId!=vId||!emergePort.equals(port)||!emergeEdgeName.equals(edgeName)) continue;
                usize+=icmSetSize;
                emergeVIdList.remove(i);
                emergeVPortList.remove(i);
                emergeVNameList.remove(i);
                break;
            }

            if(usize==0) continue;
            Set<Long> tTmp=new HashSet<>(rtvEdge.getIcmSet());
            if(usize!=tTmp.size()) {
                tTmp.addAll(icmSet);
            }
            if(!newTargetMap.containsKey(edgeName)) {
                List<Set<Long>> refU=new ArrayList<>();
                refU.add(tTmp);
                newTargetMap.put(edgeName,refU);
            }else {
                newTargetMap.get(edgeName).add(tTmp);
            }
        }

        for(RelationToClassEdge rtcEdge:targetRNode.getRtcEdges()) {
            String port=rtcEdge.getPort();
            String edgeName=rtcEdge.getName();
            int usize=rtcEdge.getIcmSet().size();
            Long cId=rtcEdge.getEnder().getId();//获取class的id
            int emCSize=emergeCIdList.size();
            for(int i=0;i<emCSize;i++) {
                Long emergeCId=emergeCIdList.get(i);
                String emergePort=emergeCPortList.get(i);
                String emergeEdgeName=emergeCNameList.get(i);
                if(emergeCId!=cId||!emergePort.equals(port)||!emergeEdgeName.equals(edgeName)) continue;
                usize+=icmSetSize;
                emergeCIdList.remove(i);
                emergeCNameList.remove(i);
                emergeCPortList.remove(i);
                break;
            }

            if(usize==0) continue;
            Set<Long> tTmp=new HashSet<>(rtcEdge.getIcmSet());
            if(usize!=tTmp.size()) {
                tTmp.addAll(icmSet);
            }
            if(!newTargetMap.containsKey(edgeName)) {
                List<Set<Long>> refU=new ArrayList<>();
                refU.add(tTmp);
                newTargetMap.put(edgeName,refU);
            }else {
                newTargetMap.get(edgeName).add(tTmp);
            }
        }

        //这部分就是我们要新加入的边
        for(int i=0;i<emergeVIdList.size();i++) {
            Set<Long> tTmp=new HashSet<>(icmSet);
//            String port=emergeVPortList.get(i);
            String edgeName=emergeVNameList.get(i);
            if(!newTargetMap.containsKey(edgeName)) {
                List<Set<Long>> refU=new ArrayList<>();
                refU.add(tTmp);
                newTargetMap.put(edgeName,refU);
            }else {
                newTargetMap.get(edgeName).add(tTmp);
            }
        }

        for(int i=0;i<emergeCIdList.size();i++) {
            Set<Long> tTmp=new HashSet<>(icmSet);
            String edgeName=emergeCNameList.get(i);
            if(!newTargetMap.containsKey(edgeName)) {
                List<Set<Long>> refU=new ArrayList<>();
                refU.add(tTmp);
                newTargetMap.put(edgeName,refU);
            }else {
                newTargetMap.get(edgeName).add(tTmp);
            }
        }

        //完成了newTargetMap的构建
//        double oldSourceEntropy=entropyHandler.computeMapEntropy(oldSourceMap,nodeSum);
        double oldSourceEntropy = sourceRNode.getBiEntropyValue()*nodeSum;
        double newSourceEntropy=entropyHandler.computeMapEntropy(newSourceMap, simulateNodeSum);
//        double oldTargetEntropy=entropyHandler.computeMapEntropy(oldTargetMap,nodeSum);
        double oldTargetEntropy = targetRNode.getBiEntropyValue()*nodeSum;
        double newTargetEntropy=entropyHandler.computeMapEntropy(newTargetMap, simulateNodeSum);

        //获取变化的var值
        double sourceVar=newSourceEntropy-oldSourceEntropy;
        double targetVar=newTargetEntropy-oldTargetEntropy;
        sumEntropyVar+=var;
        sumEntropyVar+=sourceVar;
        sumEntropyVar+=targetVar;

        double simulateMigrateEntropy = simulateMigrateBiEntropy*nodeSum;
        double unChangeBiEntropy = (systemEntropy - simulateMigrateEntropy)/nodeSum;
        double migratedSystemEntropy = unChangeBiEntropy * simulateNodeSum + simulateMigrateEntropy + sumEntropyVar;
        double resVar = migratedSystemEntropy - systemEntropy;

        return resVar;
    }

    public void migrateRelationNodeForOneStep(Set<Long> icmSet,Integer sourceRelationNodeListId,Integer targetRelationNodeListId) {
        //这个地方涉及数据库的操作,我必须要非常小心这一点
        RelationNode sourceRelationNode=relationNodeList.get(sourceRelationNodeListId);
        RelationNode targetRelationNode=relationNodeList.get(targetRelationNodeListId);

//        sourceRelationNode.getIcmSet().removeAll(new HashSet<>(icmSet));
//        targetRelationNode.getIcmSet().addAll(new HashSet<>(icmSet));
        sourceRelationNode.removeIcmSetFromSet(icmSet);
        targetRelationNode.addIcmSetFromSet(icmSet);

        Long oneIcmId = icmSet.iterator().next();

        //对于sourceRelationNode的RelationToValue部分
        for(RelationToValueEdge rtvEdge_target : targetRelationNode.getRtvEdges())
            rtvEdge_target.setIsChanged(false);

        for(RelationToValueEdge rtvEdge : sourceRelationNode.getRtvEdges()) {
            rtvEdge.setIsChanged(false);
            if(rtvEdge.getIcmSet().size()==0||!rtvEdge.getIcmSet().contains(oneIcmId)) {
                continue;
            }

            rtvEdge.setIcmSetPreCopy(new HashSet<>(rtvEdge.getIcmSet()));//将这个存储一个备份
            rtvEdge.setIsChanged(true);
//            rtvEdge.getIcmSet().removeAll(icmSet);
            rtvEdge.removeIcmSetFromSet(icmSet);
            String port=rtvEdge.getPort();
            String edgeName=rtvEdge.getName();
            ValueNode valueNode=rtvEdge.getEnder();
            //下面要把该边上的该用户从sourceRelationNode迁移到targetRelationNode
            boolean isContainFlag=false;
            for(RelationToValueEdge rtvEdge_target : targetRelationNode.getRtvEdges()) {
                if (rtvEdge_target.getPort().equals(port) && rtvEdge_target.getName().equals(edgeName)
                        && rtvEdge_target.getEnder().getId().equals(valueNode.getId())) {

                    rtvEdge_target.setIcmSetPreCopy(new HashSet<Long>(rtvEdge_target.getIcmSet()));//将这个存储一个备份
                    rtvEdge_target.setIsChanged(true);
                    isContainFlag=true;//targetRelationNode中已经包含了该节点
//                    rtvEdge_target.getIcmSet().addAll(icmSet);
                    rtvEdge_target.addIcmSetFromSet(icmSet);
                    break;
                }else;
            }
            if(!isContainFlag) {//说明在上面的遍历过程中并没有找到这个边
                Set<Long> tTmpSet=new HashSet<>(icmSet);
                RelationToValueEdge tmpRtvEdge=new RelationToValueEdge(port,edgeName,targetRelationNode,valueNode);
                tmpRtvEdge.setIcmSet(tTmpSet);
                tmpRtvEdge.setIsChanged(true);
                tmpRtvEdge.setId(curIdLoc++);
                tmpRtvEdge.setIcmSetPreCopy(new HashSet<Long>());
                targetRelationNode.getRtvEdges().add(tmpRtvEdge);//我觉得这句话可以去掉的
                valueNode.getRtvEdges().add(tmpRtvEdge);//这句应该也可以去掉的
//                relationToVEdgeRepository.save(tmpRtvEdge);//relationToVEdgeRepository这个
            }
        }

        //对于sourceRelationNode的relationToClass部分
        for(RelationToClassEdge rtcEdge_target : targetRelationNode.getRtcEdges())
            rtcEdge_target.setIsChanged(false);

        for(RelationToClassEdge rtcEdge : sourceRelationNode.getRtcEdges()) {
            if(rtcEdge.getIcmSet().size()==0||!rtcEdge.getIcmSet().contains(oneIcmId)) {
                rtcEdge.setIsChanged(false);
                continue;
            }

            rtcEdge.setIcmSetPreCopy(new HashSet<>(rtcEdge.getIcmSet()));//将这个存储一个备份
            rtcEdge.setIsChanged(true);
//            rtcEdge.getIcmSet().removeAll(icmSet);
            rtcEdge.removeIcmSetFromSet(icmSet);
            String port=rtcEdge.getPort();
            String edgeName=rtcEdge.getName();
            ClassNode classNode=rtcEdge.getEnder();
            //下面要把该边上的该用户从sourceRelationNode迁移到targetRelationNode上去
            boolean isContainFlag=false;
            for(RelationToClassEdge rtcEdge_target : targetRelationNode.getRtcEdges()) {
                if(rtcEdge_target.getPort().equals(port) && rtcEdge_target.getName().equals(edgeName)
                        && rtcEdge_target.getEnder().getId().equals(classNode.getId())) {
                    rtcEdge_target.setIsChanged(true);
                    rtcEdge_target.setIcmSetPreCopy(new HashSet<>(rtcEdge_target.getIcmSet()));//将这个存储一个备份
                    isContainFlag=true;
//                    rtcEdge_target.getIcmSet().addAll(icmSet);
                    rtcEdge_target.addIcmSetFromSet(icmSet);
                    break;
                }else;
            }
            if(!isContainFlag) {//说明在上面的遍历过程中并没有找到这个边
                Set<Long> tTmpSet=new HashSet<>(icmSet);
                RelationToClassEdge tmpRtcEdge=new RelationToClassEdge(port,edgeName,targetRelationNode,classNode);
                tmpRtcEdge.setIcmSet(tTmpSet);
                tmpRtcEdge.setIsChanged(true);
                tmpRtcEdge.setId(curIdLoc++);
                tmpRtcEdge.setIcmSetPreCopy(new HashSet<Long>());
                targetRelationNode.getRtcEdges().add(tmpRtcEdge);
                classNode.getRtcEdges().add(tmpRtcEdge);
            }
        }
    }

    public Double migrateRelationNodeNeedTwoStep(Long icmId,Integer sourceRelationNodeListId,Integer targetRelationNodeListId) {
        //首先是判断如果targetRelation没有当前icmId用户,将sourceRelation上的icmId迁移到targetClass上是否会减小熵值,如果会则执行该步骤,否则不执行
        //为targetRelation上的icmId用户找寻适合其迁移的最佳位置,判断这个迁移会造成多少熵值增加
        //如果增加的比迁移过来的减少的少,则进行迁移操作,否则不迁移
        RelationNode sourceRelationNode=relationNodeList.get(sourceRelationNodeListId);
        RelationNode targetRelationNode=relationNodeList.get(targetRelationNodeListId);

        Set<Long> icmIdSet = new HashSet<>();
        icmIdSet.add(icmId);

        double minEntropyDown=0x7FFFFFFF;
        Integer minVarRNodeId=-1;  //我们希望找到的是引起targetRelation节点迁移到的目标节点熵值上升度最小的节点
        Boolean isTravseNUllNode=false;  //是否遍历空节点的情况

        //这里的目标是把target上的relation节点迁移到otherRelationNode上去,看看是否有效果
        Set<Integer> thirdPartRNodeListIdSet = migrateUtil.findConRelationNodes(targetRelationNode);

        for(Integer tmpListId : thirdPartRNodeListIdSet) {
            RelationNode otherRelationNode = relationNodeList.get(tmpListId);
            if(otherRelationNode.getIcmSet().contains(icmId)) continue;
            boolean targetIsNullFlag = false;
            if(isTravseNUllNode && otherRelationNode.getIcmSet().size() == 0) continue;
            if(otherRelationNode.getIcmSet().size() == 0) {
                targetIsNullFlag=true;
                isTravseNUllNode=true;
            }
            double var=simulateMigrateForRelation(icmIdSet,targetRelationNode,otherRelationNode,targetIsNullFlag);
            if((Double.compare(minEntropyDown,var)>0 && Math.abs(minEntropyDown - var) > 0.00001 )
                    || (Double.compare(var,minEntropyDown)==0
                    && targetRelationNode.getIcmSet().size()==1 && otherRelationNode.getIcmSet().size() != 0)) {
                minEntropyDown=var;
                minVarRNodeId=otherRelationNode.getLoc();
            }
        }

        boolean isUsedNullNode = false;
        if(!isTravseNUllNode && targetRelationNode.getIcmSet().size()!=1) {
            RelationNode tRelationNode=new RelationNode();
            double var=simulateMigrateForRelation(icmIdSet,targetRelationNode,tRelationNode,true);
            if(Double.compare(minEntropyDown,var)>0 && Math.abs(minEntropyDown - var) > 0.00001) {
                isUsedNullNode=true;
                minEntropyDown=var;
                relationNodeList.add(tRelationNode);
                tRelationNode.setLoc(relationNodeList.size()-1);
                tRelationNode.setId(curIdLoc++);
                minVarRNodeId=tRelationNode.getLoc();
            }else tRelationNode=null;
        }

        int recoverNodeSum=this.nodeSum;
        double recoverSystemEntropy = systemEntropy;

        if(minVarRNodeId!=-1) {//说明确实找到了可以让该节点熵值下降的通道

//            printMigrateValue(targetRelationNode,relationNodeList.get(minVarRNodeId));

            if(relationNodeList.get(targetRelationNodeListId).getIcmSet().size()==1) this.nodeSum--;
            if(relationNodeList.get(minVarRNodeId).getIcmSet().size()==0) this.nodeSum++;



            //将targetRelation上的icmId正式迁移到minVarRNodeId节点上去
            migrateRelationNodeForOneStep(icmIdSet, targetRelationNodeListId, minVarRNodeId);
            //如果需要恢复到迁移前,则在下面启动恢复过程

            systemEntropy += minEntropyDown;
            reComputeMigrateRelationNodeEntropy(targetRelationNodeListId,minVarRNodeId);
//            printMigrateValue(targetRelationNode,relationNodeList.get(minVarRNodeId));//这是用来验证的
        }else return 0.0;
        //上面这个migrateRelationNodeForOneStep实实在在的把targetRelationNode上的icmId迁移到了minVarRNodeId对应节点上

        boolean secondStepFlag=false;
        if(targetRelationNode.getIcmSet().size()==0) secondStepFlag=true;
        double simVar=simulateMigrateForRelation(icmIdSet, sourceRelationNode, targetRelationNode , secondStepFlag);
        if((Double.compare(simVar,0.0)>=0 && Math.abs(simVar - 0.0) > 0.00001) || Math.abs(simVar - 0.0)<0.00001 ) {
            //说明这步迁移是没有意义的,我们接下来判断刚才的迁移是否需要复原
            if(Double.compare(minEntropyDown,0.0)>0 ||
                    ((Double.compare(minEntropyDown,0.0)==0 || Math.abs(minEntropyDown - 0.0)<0.00001) && !(targetRelationNode.getIcmSet().size()==0
                            && relationNodeList.get(minVarRNodeId).getIcmSet().size()>1))) {
                //需要复原之前的迁移
                recoverMigrateStateForRelationNode(icmId,targetRelationNodeListId,minVarRNodeId,isUsedNullNode);//还原原有的节点格局
                recoverEdgeStateForRelationNode(targetRelationNodeListId);
                recoverEdgeStateForRelationNode(minVarRNodeId);
                recoverMigrateRelationNode(targetRelationNodeListId,minVarRNodeId);
                removeRecoverRelationNullNode(minVarRNodeId);//去除这边多余的0边
                systemEntropy = recoverSystemEntropy;
                this.nodeSum=recoverNodeSum;
            }else {
                isStable=false;
                removeNullEdgeForRelationNode(targetRelationNodeListId);
                System.out.println("发生两步迁移操作:首步成功,用户编号:"+icmId+" ,targetRelationNodeListId为:"+
                        targetRelationNodeListId+ " ,minVarRNodeId为:"+minVarRNodeId);
            }//不需要复原
        }else {
            //说明当前的迁移是有意义的,但是我们还是需要判断这次两步迁移是否会造成系统熵值上升
            double tmpSimVar=-simVar;//将负值先转换为正的
            if(Double.compare(minEntropyDown,0.0)>=0 ||
                    (Double.compare(minEntropyDown,0.0)==0 && !(targetRelationNode.getIcmSet().size()==0
                            && relationNodeList.get(minVarRNodeId).getIcmSet().size()>1))) {
                double resSimVar=tmpSimVar-minEntropyDown;
                if(Double.compare(resSimVar,0.0)>=0 && Math.abs(resSimVar-0.0)>0.00001) {//说明迁移后系统熵值减小,这是成功的
                    if(relationNodeList.get(sourceRelationNodeListId).getIcmSet().size()==1) this.nodeSum--;
                    if(relationNodeList.get(targetRelationNodeListId).getIcmSet().size()==0) this.nodeSum++;
                    removeNullEdgeForRelationNode(targetRelationNodeListId);
                    migrateRelationNodeForOneStep(icmIdSet, sourceRelationNodeListId, targetRelationNodeListId);
                    reComputeMigrateRelationNodeEntropy(sourceRelationNodeListId,targetRelationNodeListId);
                    removeNullEdgeForRelationNode(sourceRelationNodeListId);
                    systemEntropy += simVar;
                    isStable=false;
                    System.out.println("发生两步迁移操作:首步成功,用户编号:"+icmId+" ,targetRelationNodeListId为:"+
                            targetRelationNodeListId+ " ,minVarRNodeId为:"+minVarRNodeId);
                    System.out.println("首步迁移的熵值下降为: "+minEntropyDown);
                    System.out.println("发生两步迁移操作:次步成功,用户编号:"+icmId+" ,sourceRelationNodeListId为:"+
                            sourceRelationNodeListId+ " ,targetRelationNodeListId为:"+targetRelationNodeListId);
                    System.out.println("次步迁移的熵值下降为: "+simVar);
                }else {//resSimVar<0.0说明系统熵值总体上升了,因此必须回复全部初始数据
                    recoverMigrateStateForRelationNode(icmId,targetRelationNodeListId,minVarRNodeId,isUsedNullNode);//还原原有的节点格局
                    recoverEdgeStateForRelationNode(targetRelationNodeListId);
                    recoverEdgeStateForRelationNode(minVarRNodeId);
                    recoverMigrateRelationNode(targetRelationNodeListId,minVarRNodeId);
                    removeRecoverRelationNullNode(minVarRNodeId);//去除这边多余的0边
                    systemEntropy = recoverSystemEntropy;
                    this.nodeSum=recoverNodeSum;
                }
            }else {
                //成功,我们需要将souceRelation上的icmId用户迁移到targetRelation上去
                if(relationNodeList.get(sourceRelationNodeListId).getIcmSet().size()==1) this.nodeSum--;
                if(relationNodeList.get(targetRelationNodeListId).getIcmSet().size()==0) this.nodeSum++;
                removeNullEdgeForRelationNode(targetRelationNodeListId);
                migrateRelationNodeForOneStep(icmIdSet, sourceRelationNodeListId, targetRelationNodeListId);
                reComputeMigrateRelationNodeEntropy(sourceRelationNodeListId,targetRelationNodeListId);
                removeNullEdgeForRelationNode(sourceRelationNodeListId);
                systemEntropy += simVar;
                isStable=false;
                System.out.println("发生两步迁移操作:首步成功,用户编号:"+icmId+" ,targetRelationNodeListId为:"+
                        targetRelationNodeListId+ " ,minVarRNodeId为:"+minVarRNodeId);
                System.out.println("发生两步迁移操作:次步成功,用户编号:"+icmId+" ,sourceRelationNodeListId为:"+
                        sourceRelationNodeListId+ " ,targetRelationNodeListId为:"+targetRelationNodeListId);
            }
        }
        return simVar+minEntropyDown;
    }


    /**
     * 获取一组不重复的随机序列,长度为总长,元素范围为0~(class+relation)-1
     * @return 随机数(范围在0~class和relation节点总数-1)
     */
    public int[] randomValue() {
        int sum=classNodeList.size()+relationNodeList.size();
        int[] randList = new int[sum];
        for(int i=0;i<sum;i++) {
            randList[i]=i;
        }//填充了初始的randList列表

        Random random=new Random();
        int x=0,tmp=0;

        for(int i=sum-1;i>0;i--) {
            int curTarget=Math.abs(random.nextInt()%sum);
            tmp=randList[i];
            randList[i]=randList[curTarget];
            randList[curTarget]=tmp;
        }
        return randList;
    }

    private List<ClassNode> convertClassIdToObj(Set<Long> classNodeIdSet) {
        List<ClassNode> classNodeList=new ArrayList<ClassNode>();
        for(Long id:classNodeIdSet) {
            ClassNode classNode=classNodeRepository.findOne(id);
            classNodeList.add(classNode);
        }
        return classNodeList;
    }

    private List<RelationNode> convertRelationIdToObj(Set<Long> relationNodeIdSet) {
        List<RelationNode> relationNodeList=new ArrayList<RelationNode>();
        for(Long id:relationNodeIdSet) {
            RelationNode relationNode=relationNodeRepository.findOne(id);
            relationNodeList.add(relationNode);
        }
        return relationNodeList;
    }

    private List<ValueNode> convertValueIdToObj(Set<Long> valueNodeIdSet) {
        List<ValueNode> valueNodeList=new ArrayList<ValueNode>();
        for(Long id:valueNodeIdSet) {
            ValueNode valueNode=valueNodeRepository.findOne(id);
            valueNodeList.add(valueNode);
        }
        return valueNodeList;
    }

    private void reComputeMigrateClassNodeEntropy(int sourceClassNodeListId,int targetClassNodeListId) {
        ClassNode sourceClassNode = classNodeList.get(sourceClassNodeListId);
        ClassNode targetClassNode = classNodeList.get(targetClassNodeListId);

        Set<Long> relationNodeIdSet = new HashSet<>();//防止relationNode节点重复set
        Set<Long> valueNodeIdSet = new HashSet<>();//防止valueNode节点重复set

        for(RelationToClassEdge rtcEdge : sourceClassNode.getRtcEdges()) {
            RelationNode relationNode = rtcEdge.getStarter();
            if(!relationNodeIdSet.contains(relationNode.getId())) {
                relationNode.setPostBiEntropyValue(relationNode.getBiEntropyValue());
                relationNode.setBiEntropyValue(entropyHandler.computeMapBiEntropy(entropyHandler.getMapForRelationNode
                        (relationNode.getRtcEdges(),relationNode.getRtvEdges())));
                relationNodeIdSet.add(relationNode.getId());
            }else continue;
        }

        for(ClassToValueEdge ctvEdge : sourceClassNode.getCtvEdges())  {
            ValueNode valueNode = ctvEdge.getEnder();
            if(!valueNodeIdSet.contains(valueNode.getId())) {
                valueNode.setPostBiEntropyValue(valueNode.getBiEntropyValue());
//                valueNode.setBiEntropyValue(entropyHandler.computeMapEntropy(entropyHandler.getMapForValueNode(
//                        valueNode.getCtvEdges(),valueNode.getRtvEdges()),nodeSum)/nodeSum);
                valueNode.setBiEntropyValue(entropyHandler.computeMapBiEntropy(entropyHandler.getMapForValueNode(
                        valueNode.getCtvEdges(),valueNode.getRtvEdges())));
                valueNodeIdSet.add(valueNode.getId());
            }else continue;
        }

        sourceClassNode.setPostBiEntropyValue(sourceClassNode.getBiEntropyValue());
//        sourceClassNode.setBiEntropyValue(entropyHandler.computeMapEntropy(entropyHandler.getMapForClassNode(
//                sourceClassNode.getCtvEdges(),sourceClassNode.getRtcEdges()),nodeSum)/nodeSum);
        sourceClassNode.setBiEntropyValue(entropyHandler.computeMapBiEntropy(entropyHandler.getMapForClassNode(
                sourceClassNode.getCtvEdges(),sourceClassNode.getRtcEdges())));

        targetClassNode.setPostBiEntropyValue(targetClassNode.getBiEntropyValue());
        targetClassNode.setBiEntropyValue(entropyHandler.computeMapBiEntropy(entropyHandler.getMapForClassNode(
                targetClassNode.getCtvEdges(),targetClassNode.getRtcEdges())));
    }

    private void reComputeMigrateRelationNodeEntropy(int sourceRelationNodeListId,int targetRelationNodeListId) {
        RelationNode sourceRelationNode = relationNodeList.get(sourceRelationNodeListId);
        RelationNode targetRelationNode = relationNodeList.get(targetRelationNodeListId);

        Set<Long> classNodeIdSet = new HashSet<>();//防止classNode节点重复set
        Set<Long> valueNodeIdSet = new HashSet<>();//防止classNode节点重复set

        for(RelationToClassEdge rtcEdge : sourceRelationNode.getRtcEdges()) {
            ClassNode classNode = rtcEdge.getEnder();
            if(!classNodeIdSet.contains(classNode.getId())) {
                classNode.setPostBiEntropyValue(classNode.getBiEntropyValue());
                classNode.setBiEntropyValue(entropyHandler.computeMapBiEntropy(entropyHandler.getMapForClassNode
                        (classNode.getCtvEdges(),classNode.getRtcEdges())));
                classNodeIdSet.add(classNode.getId());
            }else continue;
        }

        for(RelationToValueEdge rtvEdge : sourceRelationNode.getRtvEdges()) {
            ValueNode valueNode = rtvEdge.getEnder();
            if(!valueNodeIdSet.contains(valueNode.getId())) {
                valueNode.setPostBiEntropyValue(valueNode.getBiEntropyValue());
                valueNode.setBiEntropyValue(entropyHandler.computeMapBiEntropy(entropyHandler.getMapForValueNode(
                        valueNode.getCtvEdges(),valueNode.getRtvEdges())));
                valueNodeIdSet.add(valueNode.getId());
            }else continue;
        }

        sourceRelationNode.setPostBiEntropyValue(sourceRelationNode.getBiEntropyValue());
        sourceRelationNode.setBiEntropyValue(entropyHandler.computeMapBiEntropy(entropyHandler.getMapForRelationNode
                (sourceRelationNode.getRtcEdges(),sourceRelationNode.getRtvEdges())));

        targetRelationNode.setPostBiEntropyValue(targetRelationNode.getBiEntropyValue());
        targetRelationNode.setBiEntropyValue(entropyHandler.computeMapBiEntropy(entropyHandler.getMapForRelationNode(
                targetRelationNode.getRtcEdges(),targetRelationNode.getRtvEdges())));
    }

    private void recoverMigrateClassNode(int sourceClassNodeListId,int targetClassNodeListId) {
        ClassNode sourceClassNode = classNodeList.get(sourceClassNodeListId);

        Set<Long> relationNodeIdSet = new HashSet<>();//防止relationNode节点重复set
        Set<Long> valueNodeIdSet = new HashSet<>();//防止valueNode节点重复set

        for(RelationToClassEdge rtcEdge : sourceClassNode.getRtcEdges()) {
            RelationNode relationNode = rtcEdge.getStarter();
            if(!relationNodeIdSet.contains(relationNode.getId())) {
                relationNode.setBiEntropyValue(relationNode.getPostBiEntropyValue());
                relationNodeIdSet.add(relationNode.getId());
            }else continue;
        }

        for(ClassToValueEdge ctvEdge : sourceClassNode.getCtvEdges())  {
            ValueNode valueNode = ctvEdge.getEnder();
            if(!valueNodeIdSet.contains(valueNode.getId())) {
                valueNode.setBiEntropyValue(valueNode.getPostBiEntropyValue());
                valueNodeIdSet.add(valueNode.getId());
            }else continue;
        }

        sourceClassNode.setBiEntropyValue(sourceClassNode.getPostBiEntropyValue());
        if(targetClassNodeListId<classNodeList.size()) {
            ClassNode targetClassNode = classNodeList.get(targetClassNodeListId);
            targetClassNode.setBiEntropyValue(targetClassNode.getPostBiEntropyValue());
        }
    }

    private void recoverMigrateRelationNode(int sourceRelationNodeListId,int targetRelationNodeListId) {
        RelationNode sourceRelationNode = relationNodeList.get(sourceRelationNodeListId);

        Set<Long> classNodeIdSet = new HashSet<>();//防止classNode节点重复set
        Set<Long> valueNodeIdSet = new HashSet<>();//防止valueNode节点重复set

        for(RelationToClassEdge rtcEdge : sourceRelationNode.getRtcEdges()) {
            ClassNode classNode = rtcEdge.getEnder();
            if(!classNodeIdSet.contains(classNode.getId()))  {
                classNode.setBiEntropyValue(classNode.getPostBiEntropyValue());
                classNodeIdSet.add(classNode.getId());
            }else continue;
        }

        for(RelationToValueEdge rtvEdge : sourceRelationNode.getRtvEdges()) {
            ValueNode valueNode = rtvEdge.getEnder();
            if(!valueNodeIdSet.contains(valueNode.getId())) {
                valueNode.setBiEntropyValue(valueNode.getPostBiEntropyValue());
                valueNodeIdSet.add(valueNode.getId());
            }else continue;
        }

        sourceRelationNode.setBiEntropyValue(sourceRelationNode.getPostBiEntropyValue());

        if(targetRelationNodeListId<relationNodeList.size()) {
            RelationNode targetRelationNode = relationNodeList.get(targetRelationNodeListId);
            targetRelationNode.setBiEntropyValue(targetRelationNode.getPostBiEntropyValue());
        }
    }

    /**
     *这是用于两步迁移时的回复
     * @param icmId
     * @param targetClassNodeListId
     * @param minVarCNodeListId
     */
    private void recoverMigrateStateForClassNode(Long icmId,int targetClassNodeListId,
                                                 int minVarCNodeListId,boolean isUsedNullNode) {
        ClassNode sourceCNode = classNodeList.get(targetClassNodeListId);
//        sourceCNode.getIcmSet().add(icmId);
        sourceCNode.addIcmId(icmId);
        if(!isUsedNullNode) {
            ClassNode targetCNode = classNodeList.get(minVarCNodeListId);
//            targetCNode.getIcmSet().remove(icmId);
            targetCNode.removeIcmId(icmId);
        }else {
            //这个不是仅仅删除节点这么简单,还要删除边,以及边另一端的节点
            ClassNode tmpCNode =classNodeList.get(minVarCNodeListId);
            for(ClassToValueEdge ctvEdge : tmpCNode.getCtvEdges()) {
                ctvEdge.getEnder().getCtvEdges().remove(ctvEdge);
            }
            for(RelationToClassEdge rtcEdge : tmpCNode.getRtcEdges()) {
                rtcEdge.getStarter().getRtcEdges().remove(rtcEdge);
            }
            classNodeList.remove(classNodeList.size()-1);
        }
    }

    private void removeRecoverClassNullNode(int minVarCNodeListId) {
        if(minVarCNodeListId >= classNodeList.size()) return;
        ClassNode targetCNode = classNodeList.get(minVarCNodeListId);
        Set<RelationToClassEdge> rtcList = new HashSet<>(targetCNode.getRtcEdges());
        Set<ClassToValueEdge> ctvList = new HashSet<>(targetCNode.getCtvEdges());
        for(RelationToClassEdge rtcEdge : rtcList)
            if(rtcEdge.getIcmSet().size()==0) {
                rtcEdge.getStarter().getRtcEdges().remove(rtcEdge);
                targetCNode.getRtcEdges().remove(rtcEdge);
            }
        for(ClassToValueEdge ctvEdge : ctvList)
            if(ctvEdge.getIcmSet().size()==0) {
                ctvEdge.getEnder().getCtvEdges().remove(ctvEdge);
                targetCNode.getCtvEdges().remove(ctvEdge);
            }
    }

    private void recoverMigrateStateForRelationNode(Long icmId,int targetRelationNodeListId,
                                                    int minVarRNodeListId,boolean isUsedNullNode) {
        RelationNode relationRNode = relationNodeList.get(targetRelationNodeListId);
//        relationRNode.getIcmSet().add(icmId);
        relationRNode.addIcmId(icmId);

        if(!isUsedNullNode) {
            RelationNode targetRNode = relationNodeList.get(minVarRNodeListId);
//            targetRNode.getIcmSet().remove(icmId);
            targetRNode.removeIcmId(icmId);
        }else {
            RelationNode tmpRNode =relationNodeList.get(minVarRNodeListId);
            for(RelationToValueEdge rtvEdge : tmpRNode.getRtvEdges()) {
                rtvEdge.getEnder().getRtvEdges().remove(rtvEdge);
            }
            for(RelationToClassEdge rtcEdge : tmpRNode.getRtcEdges()) {
                rtcEdge.getEnder().getRtcEdges().remove(rtcEdge);
            }
            relationNodeList.remove(relationNodeList.size()-1);
        }
    }

    private void removeRecoverRelationNullNode(int minVarRNodeListId) {
        if(minVarRNodeListId >= relationNodeList.size()) return;
        RelationNode targetRNode = relationNodeList.get(minVarRNodeListId);
        Set<RelationToClassEdge> rtcList = new HashSet<>(targetRNode.getRtcEdges());
        Set<RelationToValueEdge> rtvList = new HashSet<>(targetRNode.getRtvEdges());
        for(RelationToClassEdge rtcEdge : rtcList)
            if(rtcEdge.getIcmSet().size()==0) {
                rtcEdge.getEnder().getRtcEdges().remove(rtcEdge);
                targetRNode.getRtcEdges().remove(rtcEdge);
            }
        for(RelationToValueEdge rtvEdge : rtvList)
            if(rtvEdge.getIcmSet().size()==0) {
                rtvEdge.getEnder().getRtvEdges().remove(rtvEdge);
                targetRNode.getRtvEdges().remove(rtvEdge);
            }
    }

    private void recoverEdgeStateForClassNode(int classNodeListId) {
        if(classNodeListId >= classNodeList.size()) return;
        ClassNode cNode = classNodeList.get(classNodeListId);
        for(RelationToClassEdge rtcEdge : cNode.getRtcEdges()) {
            if(!rtcEdge.isChanged()) continue;
            else {
                rtcEdge.setIcmSet(new HashSet<Long>(rtcEdge.getIcmSetPreCopy()));
                rtcEdge.setIsChanged(false);
            }
        }

        for(ClassToValueEdge ctvEdge : cNode.getCtvEdges()) {
            if(!ctvEdge.isChanged()) continue;
            else {
                ctvEdge.setIcmSet(new HashSet<Long>(ctvEdge.getIcmSetPreCopy()));
                ctvEdge.setIsChanged(false);
            }
        }
    }

    private void  recoverEdgeStateForRelationNode(int relationNodeListId) {
        if(relationNodeListId >= relationNodeList.size()) return;
        RelationNode rNode = relationNodeList.get(relationNodeListId);
        for(RelationToClassEdge rtcEdge : rNode.getRtcEdges()) {
            if(!rtcEdge.isChanged()) continue;
            else {
                rtcEdge.setIcmSet(new HashSet<Long>(rtcEdge.getIcmSetPreCopy()));
                rtcEdge.setIsChanged(false);
            }
        }

        for(RelationToValueEdge rtvEdge : rNode.getRtvEdges()) {
            if(!rtvEdge.isChanged()) continue;
            else {
                rtvEdge.setIcmSet(new HashSet<Long>(rtvEdge.getIcmSetPreCopy()));
                rtvEdge.setIsChanged(false);
            }
        }
    }


    private void setLocForList() {
        for(int i=0;i<classNodeList.size();i++) {
            ClassNode cNode = classNodeList.get(i);
            cNode.setLoc(i);
        }
        for(int i=0;i<relationNodeList.size();i++) {
            RelationNode rNode =relationNodeList.get(i);
            rNode.setLoc(i);
        }
    }

    protected void removeNullEdgeForClassNode(int sourceCNodeListId) {
        ClassNode sourceCNode = classNodeList.get(sourceCNodeListId);

        List<RelationToClassEdge> rtcList = new ArrayList<>(sourceCNode.getRtcEdges());
        List<ClassToValueEdge> ctvList = new ArrayList<>(sourceCNode.getCtvEdges());

        for(RelationToClassEdge rtcEdge : rtcList) {
            if(rtcEdge.getIcmSet().size() == 0) {
                RelationNode relationNode = rtcEdge.getStarter();
                relationNode.getRtcEdges().remove(rtcEdge);
                sourceCNode.getRtcEdges().remove(rtcEdge);
            }
        }
        for(ClassToValueEdge ctvEdge : ctvList) {
            if(ctvEdge.getIcmSet().size() == 0) {
                ValueNode valueNode = ctvEdge.getEnder();
                valueNode.getCtvEdges().remove(ctvEdge);
                sourceCNode.getCtvEdges().remove(ctvEdge);
            }
        }
    }

    protected void removeNullEdgeForRelationNode(int sourceRNodeListId) {
        RelationNode sourceRNode = relationNodeList.get(sourceRNodeListId);

        List<RelationToClassEdge> rtcList = new ArrayList<>(sourceRNode.getRtcEdges());
        List<RelationToValueEdge> rtvList = new ArrayList<>(sourceRNode.getRtvEdges());

        for(RelationToClassEdge rtcEdge : rtcList) {
            if(rtcEdge.getIcmSet().size() == 0) {
                ClassNode classNode = rtcEdge.getEnder();
                classNode.getRtcEdges().remove(rtcEdge);
                sourceRNode.getRtcEdges().remove(rtcEdge);
            }
        }

        for(RelationToValueEdge rtvEdge : rtvList) {
            if(rtvEdge.getIcmSet().size() == 0) {
                ValueNode valueNode = rtvEdge.getEnder();
                valueNode.getRtvEdges().remove(rtvEdge);
                sourceRNode.getRtvEdges().remove(rtvEdge);
            }
        }
    }

    /******************************************华丽分界线**********************************************/
// /////////////下面这段代码主要是用于测试 验证程序是否有bug和检测结果的

    private void printMigrateValue(RelationNode sourceRelationNode,RelationNode targetRelationNode) {
        for(RelationToClassEdge rtcEdge : sourceRelationNode.getRtcEdges()) {
            ClassNode cNode = rtcEdge.getEnder();
            System.out.print("cNodeId: "+cNode.getLoc()+",熵值: "+cNode.getBiEntropyValue()+",");
        }
        System.out.println();
        for(RelationToValueEdge rtvEdge : sourceRelationNode.getRtvEdges()) {
            ValueNode vNode = rtvEdge.getEnder();
            System.out.print("vNodeId: "+vNode.getId()+",熵值: "+vNode.getBiEntropyValue()+",");
        }

        System.out.println("source熵值为: "+sourceRelationNode.getBiEntropyValue()+" ,target熵值为: "+
                targetRelationNode.getBiEntropyValue());
    }

    private double scanToComputeSystemEntropy() {
        double testBiEntropy = 0.0;
        for(int i=0;i<classNodeList.size();i++) {
            ClassNode classNode = classNodeList.get(i);
            testBiEntropy += classNode.getBiEntropyValue();
//            if(Math.abs(classNode.getBiEntropyValue()-0.0)>0.00001) {
//                System.out.println("classNode的Listid为: "+classNode.getLoc());
//            }
        }
        for(int i=0;i<relationNodeList.size();i++) {
            RelationNode relationNode = relationNodeList.get(i);
            testBiEntropy += relationNode.getBiEntropyValue();
//            if (Math.abs(relationNode.getBiEntropyValue() - 0.0) > 0.00001) {
//                System.out.println("relationNode的Listid为: " + relationNode.getLoc());
//            }
        }
        for(int i=0;i<valueNodeList.size();i++) {
            ValueNode valueNode = valueNodeList.get(i);
            testBiEntropy +=valueNode.getBiEntropyValue();
//            if (Math.abs(valueNode.getBiEntropyValue() - 0.0) > 0.00001) {
//                System.out.println("valueNode的名字为: " + valueNode.getName());
//            }
        }
        return testBiEntropy * nodeSum;
    }

    private void scanToFindBug() {
        for(int i=0;i<classNodeList.size();i++) {
            ClassNode cNode = classNodeList.get(i);
            int icmSum=cNode.getIcmSet().size();
            for(ClassToValueEdge ctvEdge : cNode.getCtvEdges()) {
                if(ctvEdge.getIcmSet().size()>icmSum) {
                    System.out.println("11111111");
                }
                if(ctvEdge.getIcmSet().size() == 0) {
                    System.out.println("11111111");
                }
            }

            for(RelationToClassEdge rtcEdge : cNode.getRtcEdges()) {
                if(rtcEdge.getIcmSet().size()>icmSum) {
                    System.out.println("222222222");
                    System.out.println("relation: "+rtcEdge.getStarter().getLoc());
                }
                if(rtcEdge.getIcmSet().size() == 0) {
                    System.out.println("222222222");
                }
            }
        }

        for(int i=0;i<relationNodeList.size();i++) {
            RelationNode rNode = relationNodeList.get(i);
            int icmSum=rNode.getIcmSet().size();
            for(RelationToValueEdge rtvEdge : rNode.getRtvEdges()) {
                if(rtvEdge.getIcmSet().size()>icmSum) {
                    System.out.println("3333333333");
                }
                if(rtvEdge.getIcmSet().size()==0) {
                    System.out.println("3333333333");
                }
            }

            for(RelationToClassEdge rtcEdge : rNode.getRtcEdges()) {
                if(rtcEdge.getIcmSet().size()>icmSum) {
                    System.out.println("44444444444");
                    System.out.println("relation: "+rtcEdge.getStarter().getLoc());
                }
                if(rtcEdge.getIcmSet().size()==0) {
                    System.out.println("44444444444");
                    System.out.println("relation: "+rtcEdge.getStarter().getLoc());
                }
            }
        }

        for(int i=0;i<valueNodeList.size();i++) {
            ValueNode vNode = valueNodeList.get(i);
            int icmSum = vNode.getIcmSet().size();
            for(ClassToValueEdge ctvEdge : vNode.getCtvEdges()) {
                if(ctvEdge.getIcmSet().size() > icmSum) {
                    System.out.println("55555555555");
                    System.out.println("classNode loc: "+ctvEdge.getStarter().getLoc());
                }
                if(ctvEdge.getIcmSet().size() == 0) {
                    System.out.println("55555555555");
                    System.out.println("classNode loc: "+ctvEdge.getStarter().getLoc());
                }
            }
            for(RelationToValueEdge rtvEdge : vNode.getRtvEdges()) {
                if(rtvEdge.getIcmSet().size() > icmSum) {
                    System.out.println("66666666666");
                    System.out.println("relationNode loc: "+rtvEdge.getStarter().getLoc());
                }
                if(rtvEdge.getIcmSet().size() == 0) {
                    System.out.println("66666666666");
                    System.out.println("relationNode loc: "+rtvEdge.getStarter().getLoc());
                }
            }
        }
    }

    private void scanToValidateData() {
        for(int i=0;i<classNodeList.size();i++) {
            ClassNode cNode = classNodeList.get(i);
            if(cNode.getIcmSet().size()>0) {
                System.out.println("class节点编号: "+i+" ,用户数: "+cNode.getIcmSet().size());
                ValueNode vNode = null;
                int max=0;
                for(ClassToValueEdge ctvEdge : cNode.getCtvEdges()) {
                    if(ctvEdge.getIcmSet().size() > max) {
                        max= ctvEdge.getIcmSet().size();
                        vNode = ctvEdge.getEnder();
                    }
                }
                System.out.println("指向的value节点为: "+ vNode.getName() +" ,其对应用户数为: "+max);
            }
        }
        for(int i=0;i<relationNodeList.size();i++) {
            RelationNode rNode = relationNodeList.get(i);
            if(rNode.getIcmSet().size()>0) System.out.println("relation节点编号: "+i+" ,用户数: "+rNode.getIcmSet().size());
        }
    }

}
